// components/tabs/CourseResultsTab.tsx
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  type Group,
  type User,
  type Course,
  type CourseResult,
  type ApiResponseCourseResults,
  type ApiResponseUsers,
} from ".././types";
import toast from "react-hot-toast";

interface CourseResultsTabProps {
  selectedGroup: Group;
  courses: Course[];
}

export default function CourseResultsTab({
  selectedGroup,
  courses,
}: CourseResultsTabProps) {
  const [courseResults, setCourseResults] = useState<CourseResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [scoreRange, setScoreRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 100,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchUsersAndResults = async () => {
      try {
        setIsLoading(true);

        // Fetch users in the group
        const usersRes = await fetch(`/api/groups?groupId=${selectedGroup.id}`);
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const userData = (await usersRes.json()) as ApiResponseUsers;
        setUsers(userData.users.filter((user) => user.role !== "Pakviestas"));

        // Fetch ALL course results for this group - no filtering parameters
        const resultsRes = await fetch(
          `/api/courses/courseResults?groupId=${selectedGroup.id}`,
        );

        const resultsData =
          (await resultsRes.json()) as ApiResponseCourseResults;
        if (!resultsRes.ok) toast.error(resultsData.message);
        else {
          setTimeout(() => setIsLoading(false), 700);
          setCourseResults(resultsData.results);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchUsersAndResults().catch(console.error);
  }, [selectedGroup.id]);

  // Apply all filters locally
  const filteredResults = useMemo(() => {
    return courseResults.filter((result) => {
      // Filter by course ID
      if (selectedCourseId && result.courseId !== selectedCourseId) {
        return false;
      }

      // Filter by user ID
      if (selectedUserId && result.userId !== selectedUserId) {
        return false;
      }

      // Filter by date range
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        const completedDate = new Date(result.endTime);
        if (completedDate < startDate) {
          return false;
        }
      }

      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59); // Set to end of day
        const completedDate = new Date(result.endTime);
        if (completedDate > endDate) {
          return false;
        }
      }

      // Filter by score range
      if (result.score < scoreRange.min || result.score > scoreRange.max) {
        return false;
      }

      // Filter by search term (user name or course name)
      if (searchTerm) {
        const resultUser = users.find(
          (user) => user.clerk_id === result.userId,
        );
        const resultCourse = courses.find(
          (course) => course.id === result.courseId,
        );

        const userFullName = resultUser
          ? `${resultUser.first_name} ${resultUser.last_name}`
          : "";

        const searchString =
          `${userFullName} ${resultCourse?.name ?? ""}`.toLowerCase();

        if (!searchString.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [
    courseResults,
    selectedCourseId,
    selectedUserId,
    dateRange.startDate,
    dateRange.endDate,
    scoreRange.min,
    scoreRange.max,
    searchTerm,
    users,
    courses,
  ]);

  const getUserName = (userId: string) => {
    const user = users.find((user) => user.clerk_id === userId);
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find((course) => course.id === courseId);
    return course ? course.name : "Unknown Course";
  };

  const resetFilters = () => {
    setSelectedCourseId(null);
    setSelectedUserId(null);
    setDateRange({ startDate: "", endDate: "" });
    setScoreRange({ min: 0, max: 100 });
    setSearchTerm("");
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${remainingSeconds}s`;
  };

  const validScores = filteredResults
    .filter(
      (result) =>
        result.status !== "Priskirtas" && result.status !== "Pradėtas",
    )
    .map((result) => Number(result.score));

  const averageScore = (
    validScores.length > 0
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 0
  ).toFixed(2);

  const validResults = filteredResults.filter(
    (result) => result.status === "Atliktas",
  );

  const timeDifferences: number[] = validResults.map((result) => {
    const startTime = new Date(result.startTime).getTime();
    const endTime = new Date(result.endTime).getTime();
    return endTime - startTime; // Time difference in milliseconds
  });

  const totalTimeDifference = timeDifferences.reduce(
    (sum, timeDiff) => sum + timeDiff,
    0,
  );

  const averageTimeMs =
    validResults.length > 0 ? totalTimeDifference / validResults.length : 0;

  const totalSeconds = Math.floor(averageTimeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  const formattedAverageTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-stone-800">
          Narių kurso rezultatai
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-50 md:w-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
            />
          </svg>
          {showFilters ? "Slėpti filtrus" : "Rodyti filtrus"}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg bg-stone-50 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-700">Filtrai</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-stone-600 hover:text-stone-800"
            >
              Atstatyti
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Course filter */}
            <div>
              <label
                htmlFor="course-filter"
                className="block text-sm font-medium text-stone-700"
              >
                Kursas
              </label>
              <select
                id="course-filter"
                className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
                value={selectedCourseId ?? ""}
                onChange={(e) =>
                  setSelectedCourseId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Visi kursai</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* User filter */}
            <div>
              <label
                htmlFor="user-filter"
                className="block text-sm font-medium text-stone-700"
              >
                Narys
              </label>
              <select
                id="user-filter"
                className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
                value={selectedUserId ?? ""}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
              >
                <option value="">Visi nariai</option>
                {users.map((user) => (
                  <option key={user.clerk_id} value={user.clerk_id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Laikotarpis
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Nuo"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="rounded-lg border border-stone-300 p-2 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
                />
                <input
                  type="date"
                  placeholder="Iki"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="rounded-lg border border-stone-300 p-2 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
                />
              </div>
            </div>

            {/* Score range */}
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Rezultato intervalas
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min"
                    value={scoreRange.min}
                    onChange={(e) =>
                      setScoreRange({
                        ...scoreRange,
                        min: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-stone-300 p-2 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Max"
                    value={scoreRange.max}
                    onChange={(e) =>
                      setScoreRange({
                        ...scoreRange,
                        max: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-stone-300 p-2 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Paieška pagal nario vardą ar kurso pavadinimą..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-stone-300 py-2 pl-10 pr-4 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="absolute left-3 top-2.5 h-5 w-5 text-stone-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      {/* Stats Summary - Mobile First! Show before table on mobile */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-3 md:hidden">
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-medium text-stone-500">
              Vidutinis rezultatas
            </h3>
            <p className="mt-2 text-2xl font-semibold text-stone-800">
              {averageScore}%
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-medium text-stone-500">
              Išlaikymo santykis
            </h3>
            <p className="mt-2 text-2xl font-semibold text-stone-800">
              {filteredResults.filter(
                (result) =>
                  result.score >= 70 &&
                  result.status !== "Priskirtas" &&
                  result.status !== "Pradėtas",
              ).length > 0 &&
              filteredResults.filter(
                (result) =>
                  result.status !== "Priskirtas" &&
                  result.status !== "Pradėtas",
              ).length > 0
                ? Math.round(
                    (filteredResults.filter(
                      (result) =>
                        result.score >= 70 &&
                        result.status !== "Priskirtas" &&
                        result.status !== "Pradėtas",
                    ).length /
                      filteredResults.filter(
                        (result) =>
                          result.status !== "Priskirtas" &&
                          result.status !== "Pradėtas",
                      ).length) *
                      100,
                  )
                : 0.0}
              %
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-medium text-stone-500">
              Vidutinė trukmė
            </h3>
            <p className="mt-2 text-2xl font-semibold text-stone-800">
              {formattedAverageTime}
            </p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-lg border border-stone-200 bg-white">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-stone-600"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-stone-600">
            Rezultatų nerasta
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table (hidden on mobile) */}
            <table className="hidden w-full table-auto md:table">
              <thead className="bg-stone-50 text-left text-sm font-medium text-stone-700">
                <tr>
                  <th className="px-4 py-3 md:px-6">Narys</th>
                  <th className="px-4 py-3 md:px-6">Kursas</th>
                  <th className="px-4 py-3 md:px-6">Atlikimo Data</th>
                  <th className="px-4 py-3 md:px-6">Rezultatas</th>
                  <th className="px-4 py-3 md:px-6">Trukmė</th>
                  <th className="px-4 py-3 md:px-6">Bandymų sk.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-stone-800">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-stone-50">
                    <td className="px-4 py-4 md:px-6">
                      {getUserName(result.userId)}
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      {getCourseName(result.courseId)}
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      {result.updatedAt
                        ? format(new Date(result.endTime), "yyyy-MM-dd HH:mm")
                        : "—"}
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center gap-2">
                        <span>{result.score ?? "0.00"}%</span>
                        <div className="h-2 w-20 rounded-full bg-stone-200">
                          <div
                            className={`h-2 rounded-full ${
                              result.score >= 70
                                ? "bg-green-500"
                                : result.score >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${result.score ?? 0.0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      {(() => {
                        if (
                          result.status === "Pradėtas" ||
                          result.status === "Priskirtas"
                        ) {
                          return "--:--:--";
                        }

                        const startTime = new Date(result.startTime).getTime();
                        const endTime = new Date(result.endTime).getTime();
                        const timeDiffMs = endTime - startTime;

                        if (isNaN(timeDiffMs)) {
                          return "Invalid Date";
                        }

                        const totalSeconds = Math.floor(timeDiffMs / 1000);
                        const hours = Math.floor(totalSeconds / 3600);
                        const minutes = Math.floor((totalSeconds % 3600) / 60);
                        const seconds = totalSeconds % 60;

                        const formattedHours = String(hours).padStart(2, "0");
                        const formattedMinutes = String(minutes).padStart(
                          2,
                          "0",
                        );
                        const formattedSeconds = String(seconds).padStart(
                          2,
                          "0",
                        );

                        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
                      })()}
                    </td>

                    <td className="px-4 py-4 md:px-6">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          result.status === "Pradėtas" || result.score == null
                            ? "bg-gray-100 text-gray-800"
                            : result.score >= 70
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {result.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards (visible only on mobile) */}
            <div className="divide-y divide-stone-100 md:hidden">
              {filteredResults.map((result) => (
                <div key={result.id} className="p-4">
                  <div className="mb-2 flex justify-between">
                    <h4 className="font-medium">
                      {getUserName(result.userId)}
                    </h4>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        result.status === "Pradėtas" || result.score == null
                          ? "bg-gray-100 text-gray-800"
                          : result.score >= 70
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.status === "Pradėtas"
                        ? "Pradėtas"
                        : result.score == null
                          ? "Neatlikta"
                          : result.score >= 70
                            ? "Išlaikyta"
                            : "Neišlaikyta"}
                    </span>
                  </div>

                  <div className="text-sm text-stone-500">
                    <div className="mb-1.5 flex justify-between">
                      <span>Kursas:</span>
                      <span className="text-stone-800">
                        {getCourseName(result.courseId)}
                      </span>
                    </div>

                    <div className="mb-1.5 flex justify-between">
                      <span>Data:</span>
                      <span className="text-stone-800">
                        {result.updatedAt
                          ? format(new Date(result.endTime), "yyyy-MM-dd HH:mm")
                          : "—"}
                      </span>
                    </div>

                    <div className="mb-1.5 flex justify-between">
                      <span>Rezultatas:</span>
                      <div className="flex items-center gap-2 text-stone-800">
                        <span>{result.score ?? "0.00"}%</span>
                        <div className="h-2 w-16 rounded-full bg-stone-200">
                          <div
                            className={`h-2 rounded-full ${
                              result.score >= 70
                                ? "bg-green-500"
                                : result.score >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${result.score ?? 0.0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span>Trukmė:</span>
                      <span className="text-stone-800">
                        {(() => {
                          if (
                            result.status === "Pradėtas" ||
                            result.status === "Priskirtas"
                          ) {
                            return "--:--:--";
                          }

                          const startTime = new Date(
                            result.startTime,
                          ).getTime();
                          const endTime = new Date(result.endTime).getTime();
                          const timeDiffMs = endTime - startTime;

                          if (isNaN(timeDiffMs)) {
                            return "Invalid Date";
                          }

                          const totalSeconds = Math.floor(timeDiffMs / 1000);
                          const hours = Math.floor(totalSeconds / 3600);
                          const minutes = Math.floor(
                            (totalSeconds % 3600) / 60,
                          );
                          const seconds = totalSeconds % 60;

                          const formattedHours = String(hours).padStart(2, "0");
                          const formattedMinutes = String(minutes).padStart(
                            2,
                            "0",
                          );
                          const formattedSeconds = String(seconds).padStart(
                            2,
                            "0",
                          );

                          return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary - Desktop (hidden on mobile) */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="mt-6 hidden grid-cols-3 gap-4 md:grid">
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-medium text-stone-500">
              Vidutinis rezultatas
            </h3>
            <p className="mt-2 text-2xl font-semibold text-stone-800">
              {averageScore}%
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-medium text-stone-500">
              Išlaikymo santykis
            </h3>
            <p className="mt-2 text-2xl font-semibold text-stone-800">
              {filteredResults.filter(
                (result) =>
                  result.score >= 70 &&
                  result.status !== "Priskirtas" &&
                  result.status !== "Pradėtas",
              ).length > 0 &&
              filteredResults.filter(
                (result) =>
                  result.status !== "Priskirtas" &&
                  result.status !== "Pradėtas",
              ).length > 0
                ? Math.round(
                    (filteredResults.filter(
                      (result) =>
                        result.score >= 70 &&
                        result.status !== "Priskirtas" &&
                        result.status !== "Pradėtas",
                    ).length /
                      filteredResults.filter(
                        (result) =>
                          result.status !== "Priskirtas" &&
                          result.status !== "Pradėtas",
                      ).length) *
                      100,
                  )
                : 0.0}
              %
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-medium text-stone-500">
              Vidutinė trukmė
            </h3>
            <p className="mt-2 text-2xl font-semibold text-stone-800">
              {formattedAverageTime}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
