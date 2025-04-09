"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Course {
  id: number;
  name: string;
  who_assigned_first_name: string;
  who_assigned_last_name: string;
}

interface ApiResponse {
  courses: Course[];
  message: string;
}
interface ApiResponseCourses {
  assignedCourses: Course[];
  message: string;
}

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchAssignedCourses = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/userCourses?userId=${userId}`);

        const data = (await res.json()) as ApiResponseCourses;
        if (!res.ok) {
          toast.error(data.message);
          return;
        }

        setCourses(data.assignedCourses);
      } catch (error) {
        console.error("Error fetching assigned courses:", error);
        toast.error("Įvyko klaida gaunant kursų sąrašą");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchAssignedCourses().catch(console.error);
    } else if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [userId, isLoaded, isSignedIn, router]);

  const handleTakeCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
    setShowConfirmation(true);
  };

  const confirmTakeCourse = () => {
    if (selectedCourseId) {
      router.push(`/my-courses/${selectedCourseId}`);
    }
    setShowConfirmation(false);
  };

  const cancelTakeCourse = () => {
    setShowConfirmation(false);
    setSelectedCourseId(null);
  };

  // Find the selected course for the modal content
  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId,
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Mano kursai</h1>
            <p className="mt-2 text-gray-600">
              Žemiau pateikti visi jums priskirti kursai.
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl"
                >
                  {/* Course header with color accent that changes on hover */}
                  <div className="h-2 bg-stone-500 transition-colors duration-300"></div>

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
                    </div>

                    {/* Divider to separate button from content */}
                    <div className="my-4 border-t border-gray-100"></div>

                    <div className="mt-4">
                      <button
                        onClick={() => handleTakeCourse(course.id)}
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
                Nėra priskirtų kursų
              </h3>
              <p className="mt-2 text-center text-gray-500">
                Šiuo metu jums nėra priskirtų kursų.
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
              Ar tikrai norite pradėti kursą „{selectedCourse?.name}&ldquo; ?
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
