"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Course {
  id: number;
  assignedId: number;
  name: string;
  status: string;
  who_assigned_first_name: string;
  who_assigned_last_name: string;
  testId: number;
  completedDate?: string;
}

interface BoughtCourse {
  id: number;
  purchaseId: number; // Unique identifier for the purchase
  name: string;
  purchaseDate: string;
  testId: number;
}

interface ApiResponseCourses {
  assignedCourses: Course[];
  boughtCourses: BoughtCourse[];
  message: string;
}

interface ErrorResponse {
  message: string;
}

export default function MyCourses() {
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [boughtCourses, setBoughtCourses] = useState<BoughtCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedAssignedId, setSelectedAssignedId] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("assigned"); // "assigned", "completed", "purchased"
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/userCourses?userId=${userId}`);

        const data = (await res.json()) as ApiResponseCourses;
        if (!res.ok) {
          toast.error(data.message);
          return;
        }

        // Store assigned courses (no need to filter these as they're in progress)
        setAssignedCourses(data.assignedCourses);

        // Process bought courses to only show the most recent purchase of each course
        const courseMap = new Map<number, BoughtCourse>();

        // Sort by purchase date (most recent first) then iterate to keep only the most recent
        const sortedCourses = [...(data.boughtCourses || [])].sort(
          (a, b) =>
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime(),
        );

        // For each course ID, keep only the most recent purchase
        sortedCourses.forEach((course) => {
          if (!courseMap.has(course.id)) {
            courseMap.set(course.id, course);
          }
        });

        // Convert map values back to array
        setBoughtCourses(Array.from(courseMap.values()));
      } catch (error) {
        console.error("Error fetching user courses:", error);
        toast.error("Įvyko klaida gaunant kursų sąrašą");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchUserCourses().catch(console.error);
    }
  }, [userId, isLoaded, isSignedIn, router]);

  const handleTakeCourse = (courseId: number, assignedId: number) => {
    setSelectedCourseId(courseId);
    setSelectedAssignedId(assignedId);
    setShowConfirmation(true);
  };

  const confirmTakeCourse = async () => {
    if (selectedCourseId) {
      const response = await fetch(
        `/api/courses/userCourses?userId=${userId}&courseId=${selectedCourseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        },
      );

      const errorData = (await response.json()) as ErrorResponse;
      if (!response.ok) {
        toast.error(errorData.message);
        return;
      }
      const res = await fetch("/api/tests/testQuestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: selectedCourse?.testId,
          userId: userId,
          assignedCourseId: selectedAssignedId,
        }),
      });
      const error = (await res.json()) as ErrorResponse;
      if (!response.ok) {
        console.error("Failed to submit test:", error.message);
        toast.error(error.message);
        return;
      }
      router.push(
        `/my-courses/${selectedCourseId}?assignedId=${selectedAssignedId}&request=assigned`,
      );
    }
    setShowConfirmation(false);
  };

  const cancelTakeCourse = () => {
    setShowConfirmation(false);
    setSelectedCourseId(null);
  };

  const handleViewAssignedCourse = (
    courseId: number,
    assignedId: number,
    status: string,
  ) => {
    if (status === "Atliktas") {
      router.push(
        `/my-courses/${courseId}?assignedId=${assignedId}&request=done`,
      );
      return;
    } else {
      router.push(
        `/my-courses/${courseId}?assignedId=${assignedId}&request=assigned`,
      );
      return;
    }
  };

  const handleViewBoughtCourse = (courseId: number, purchaseId: number) => {
    console.log("handleViewBoughtCourse", courseId, purchaseId);
    router.push(
      `/my-courses/${courseId}?assignedId=${purchaseId}&request=purchased`,
    );
  };

  // Find the selected course for the modal content
  const selectedCourse = assignedCourses.find(
    (course) => course.id === selectedCourseId,
  );

  // Filter assigned courses based on active tab
  let filteredAssignedCourses = assignedCourses.filter((course) => {
    if (activeTab === "assigned")
      return course.status === "Priskirtas" || course.status === "Pradėtas";
    if (activeTab === "completed") return course.status === "Atliktas";
    return false;
  });

  // For completed courses tab, ensure we only display one instance of each course
  if (activeTab === "completed") {
    // Sort by completion date (most recent first)
    filteredAssignedCourses.sort((a, b) => {
      const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
      const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
      return dateB - dateA;
    });

    // Create a map of courses by their ID to keep only the most recent completion
    const completedCoursesMap = new Map<number, Course>();

    filteredAssignedCourses.forEach((course) => {
      if (!completedCoursesMap.has(course.id)) {
        completedCoursesMap.set(course.id, course);
      }
    });

    // Convert map values back to array
    filteredAssignedCourses = Array.from(completedCoursesMap.values());
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Mano kursai</h1>
            <p className="mt-2 text-gray-600">
              Žemiau pateikti visi jūsų kursai.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab("assigned")}
              className={`mr-4 py-2 text-lg font-medium ${
                activeTab === "assigned"
                  ? "border-b-2 border-stone-500 text-stone-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Aktyvūs kursai
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`mr-4 py-2 text-lg font-medium ${
                activeTab === "completed"
                  ? "border-b-2 border-stone-500 text-stone-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Baigti kursai
            </button>
            <button
              onClick={() => setActiveTab("purchased")}
              className={`py-2 text-lg font-medium ${
                activeTab === "purchased"
                  ? "border-b-2 border-stone-500 text-stone-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Nupirkti kursai
            </button>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : activeTab === "purchased" ? (
            // Display bought courses
            boughtCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {boughtCourses.map((course) => (
                  <div
                    key={`purchased-${course.id}`}
                    className="course-card overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl"
                  >
                    <div className="h-2 bg-green-400 transition-colors duration-300"></div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h2 className="line-clamp-2 text-xl font-semibold text-gray-800 transition-colors duration-300">
                          {course.name}
                        </h2>
                        <div className="mt-3 flex items-center text-sm text-gray-600">
                          <svg
                            className="mr-2 h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Pirkimo data:{" "}
                            {new Date(course.purchaseDate).toLocaleDateString(
                              "lt-LT",
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="my-4 border-t border-gray-100"></div>

                      <div className="mt-4">
                        <button
                          onClick={() =>
                            handleViewBoughtCourse(course.id, course.id)
                          }
                          className="btn-primary group flex w-full items-center justify-center rounded-md border-2 border-green-500 bg-green-50 px-4 py-2 text-green-600 transition-all duration-300 hover:bg-green-100 hover:shadow-md"
                        >
                          <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Peržiūrėti kursą
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-6 shadow-md">
                <svg
                  className="mb-4 h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-700">
                  Nėra nupirktų kursų
                </h3>
                <p className="mt-2 text-center text-gray-500">
                  Šiuo metu jūs neturite nupirktų kursų.
                </p>
              </div>
            )
          ) : filteredAssignedCourses.length > 0 ? (
            // Display assigned/completed courses
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignedCourses.map((course) => (
                <div
                  key={
                    activeTab === "completed"
                      ? `completed-${course.id}`
                      : `assigned-${course.assignedId}`
                  }
                  className="course-card overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl"
                >
                  {/* Course header with color accent that changes based on status */}
                  <div
                    className={`h-2 transition-colors duration-300 ${
                      course.status === "Atliktas"
                        ? "bg-blue-400"
                        : "bg-stone-500"
                    }`}
                  ></div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h2 className="line-clamp-2 text-xl font-semibold text-gray-800 transition-colors duration-300">
                        {course.name}
                      </h2>
                      <div className="mt-3 flex items-center text-sm text-gray-600">
                        <svg
                          className="mr-2 h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>
                          Priskyrė: {course.who_assigned_first_name}{" "}
                          {course.who_assigned_last_name}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center text-sm">
                        <svg
                          className="mr-2 h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span
                          className={
                            course.status === "Pradėtas"
                              ? "text-green-600"
                              : course.status === "Atliktas"
                                ? "text-blue-600"
                                : "text-gray-600"
                          }
                        >
                          Statusas: {course.status}
                        </span>
                      </div>

                      {course.completedDate && (
                        <div className="mt-2 flex items-center text-sm">
                          <svg
                            className="mr-2 h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-gray-600">
                            Baigimo data:{" "}
                            {new Date(course.completedDate).toLocaleDateString(
                              "lt-LT",
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="my-4 border-t border-gray-100"></div>

                    <div className="mt-4">
                      {course.status === "Priskirtas" ? (
                        <button
                          onClick={() =>
                            handleTakeCourse(course.id, course.assignedId)
                          }
                          className="btn-primary group flex w-full items-center justify-center rounded-md border-2 border-stone-200 bg-white px-4 py-2 text-gray-700 transition-all duration-300 hover:border-stone-500 hover:bg-stone-50 hover:text-stone-600 hover:shadow-md"
                        >
                          <svg
                            className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          Pradėti kursą
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleViewAssignedCourse(
                              course.id,
                              course.assignedId,
                              course.status,
                            )
                          }
                          className={`btn-primary group flex w-full items-center justify-center rounded-md border-2 px-4 py-2 transition-all duration-300 hover:shadow-md ${
                            course.status === "Atliktas"
                              ? "border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "border-stone-500 bg-stone-50 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {course.status === "Atliktas" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            )}
                          </svg>
                          {course.status === "Atliktas"
                            ? "Peržiūrėti kursą"
                            : "Tęsti kursą"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-6 shadow-md">
              <svg
                className="mb-4 h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-700">
                {activeTab === "assigned"
                  ? "Nėra aktyvių kursų"
                  : "Nėra baigtų kursų"}
              </h3>
              <p className="mt-2 text-center text-gray-500">
                {activeTab === "assigned"
                  ? "Šiuo metu jums nėra priskirtų arba pradėtų kursų."
                  : "Dar nesate baigę jokių kursų."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center">
              <svg
                className="mr-3 h-8 w-8 text-stone-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800">
                Patvirtinimas
              </h3>
            </div>

            <p className="text-gray-600">
              Ar tikrai norite pradėti kursą „{selectedCourse?.name}&ldquo;?
            </p>
            <p className="mb-6 text-gray-500">Kurso kartoti negalėsite.</p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelTakeCourse}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Atšaukti
              </button>
              <button
                onClick={confirmTakeCourse}
                className="rounded-md bg-stone-500 px-4 py-2 text-white transition-colors hover:bg-stone-600"
              >
                Pradėti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
