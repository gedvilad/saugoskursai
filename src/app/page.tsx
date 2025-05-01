// app/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { createCheckoutSession } from "~/backend/subscriptions/actions/createCheckout";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

interface Course {
  id: number;
  name: string;
  productId: string;
  description: string;
}

interface ApiResponseCourses {
  courses: Course[];
  message: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/courses`);
        const data = (await res.json()) as ApiResponseCourses;

        if (!res.ok) {
          toast.error(data.message);
          return;
        }

        setCourses(data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses().catch((error) =>
      console.error("Error fetching courses:", error),
    );
  }, []);

  const handleBuyingCourse = async (productId: string) => {
    if (!userId) {
      toast.error("Prisijunkite, kad galėtumėte pirkti kursus.");
      return;
    }
    const error = await createCheckoutSession(productId, userId);
    if (error) {
      toast.error(error);
    }
  };

  const scrollToCourses = () => {
    const coursesSection = document.getElementById("courses-section");
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section
          className="py-24 text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-5xl font-bold">
                Tavo kelias į saugią darbo aplinką
              </h1>
              <p className="mb-8 text-lg">
                Mokykitės su profesionalais ir įgykite reikalingus įgūdžius
                saugiai dirbti. Mūsų kursai padės jums pasiruošti darbui ir
                užtikrinti saugumą darbo vietoje.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={scrollToCourses}
                  className="rounded-md bg-stone-600 px-8 py-3 font-bold text-white transition duration-300 hover:bg-stone-700"
                >
                  Apžvelgti kursus
                </button>
                <button className="rounded-md bg-white px-8 py-3 font-bold text-stone-600 transition duration-300 hover:bg-stone-100">
                  Sužinoti daugiau
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-semibold text-stone-800">
              Apie mus
            </h2>

            <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
              <div className="rounded-lg bg-stone-100 p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-200">
                  <svg
                    className="h-6 w-6 text-stone-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Nuotoliniai kursai
                </h3>
                <p className="text-stone-600">
                  Mokykitės patogiu laiku iš bet kurios vietos. Mūsų virtuali
                  mokymosi aplinka veikia visais įrenginiais.
                </p>
              </div>

              <div>
                <h3 className="mb-6 text-2xl font-semibold text-stone-800">
                  Ką mes siūlome
                </h3>
                <p className="mb-6 text-lg leading-relaxed text-stone-700">
                  Mes siūlome profesionalius mokymo kursus, kurie padės jums
                  įgyti reikalingus įgūdžius ir žinias apie saugą darbe. Mūsų
                  kursai yra pritaikyti įvairioms pramonės šakoms ir skirtingoms
                  darbo vietoms.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-6 w-6 text-stone-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-stone-700">
                      Interaktyvūs mokymosi kursai su praktinėmis užduotimis
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-6 w-6 text-stone-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-stone-700">
                      Išklausyto kurso medžiaga prieinama bet kuriuo metu
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 h-6 w-6 text-stone-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-stone-700">
                      Lankstus mokymosi grafikas ir prieinamumas internetu
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses-section" className="bg-stone-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-semibold text-stone-800">
              Siūlomi kursai
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course.productId}
                    className="overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-105 hover:transform"
                  >
                    <div className="flex h-40 items-center justify-center bg-stone-200">
                      <svg
                        className="h-16 w-16 text-stone-500"
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
                    </div>
                    <div className="p-6">
                      <h3 className="mb-3 text-xl font-semibold text-stone-800">
                        {course.name}
                      </h3>
                      <p className="mb-4 text-stone-600">
                        {course.description ||
                          "Sužinokite daugiau apie šį kursą ir įgykite reikalingus įgūdžius saugiam darbui."}
                      </p>
                      <button
                        className="mt-2 w-full rounded-md bg-stone-600 px-4 py-3 font-medium text-white transition duration-300 hover:bg-stone-700"
                        onClick={() => router.push(`/courses/${course.id}`)}
                        disabled={!isLoaded || course.id !== 3}
                      >
                        {course.id === 3
                          ? "Plačiau"
                          : "Bus prieinama greitu metu"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-10 text-center">
                  <p className="text-stone-600">
                    Šiuo metu kursų nėra arba reikia prisijungti, kad juos
                    pamatytumėte.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
