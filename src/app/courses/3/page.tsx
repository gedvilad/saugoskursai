// app/courses/[id]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { createCheckoutSession } from "~/backend/subscriptions/actions/createCheckout";

export const dynamic = "force-dynamic";

// Hardcoded rigging course data
const riggingCourse = {
  id: 1,
  name: "Saugus darbas su kėlimo įranga",
  productId: "prod_rigging101",
  description:
    "Išsamus kursas apie saugų darbą su kėlimo įranga ir krovinių tvirtinimą",
  fullDescription:
    "Šis profesionalus kursas apie saugų darbą su kėlimo įranga (rigging) yra skirtas visiems, kurie dirba su krovinių kėlimu, perkėlimu ir tvirtinimu. Kursas apima visus saugos aspektus, reikalavimus ir technikas, kurios padės jums užtikrinti saugų darbą su kėlimo įranga. Kursas parengtas pagal naujausius reikalavimus ir geriausias pramonės praktikas. Baigę šį kursą jūs turėsite visas reikalingas žinias, kad galėtumėte saugiai ir efektyviai dirbti su kėlimo įranga.",
  features: [
    "Kėlimo įrangos tipai ir jų saugus naudojimas",
    "Krovinių tvirtinimo technikos ir metodai",
    "Kėlimo operacijų planavimas ir rizikos vertinimas",
    "Signalizavimo ir komunikacijos protokolai kėlimo operacijose",
    "Kėlimo įrangos patikra ir priežiūra",
    "Darbo saugos taisyklės ir reglamentai",
    "Kritinių situacijų valdymas ir prevencija",
  ],
  benefits: [
    "Oficialus sertifikatas, pripažįstamas visoje Lietuvoje",
    "Praktiniai užsiėmimai su profesionalia įranga",
    "Nuolatinė prieiga prie mokymosi medžiagos",
    "Instruktorių konsultacijos",
    "Atnaujinimai apie naujausius saugos reikalavimus",
  ],
};

export default function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simulate loading the course data
    setLoading(true);
    setTimeout(() => {
      //setCourse(riggingCourse);
      setLoading(false);
    }, 500); // Simulate a short loading time
  }, []);

  const handleBuyCourse = async () => {
    if (!userId) {
      toast.error("Prisijunkite, kad galėtumėte pirkti kursus.");
      return;
    }

    if (!course) {
      toast.error("Kurso informacija nerasta.");
      return;
    }

    const error = await createCheckoutSession(riggingCourse.productId, userId);
    if (error) {
      toast.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-xl text-stone-600">
          Kraunama kurso informacija...
        </div>
      </div>
    );
  }

  // if (!course) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-stone-50">
  //       <div className="text-xl text-stone-600">Kursas nerastas</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      {/* Hero Section */}
      <section className="bg-stone-700 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold">{riggingCourse.name}</h1>
            <p className="mb-6 text-lg">{riggingCourse.description}</p>
            <button
              onClick={handleBuyCourse}
              className="rounded-md bg-stone-100 px-8 py-3 font-bold text-stone-800 transition hover:bg-white"
              disabled={!isLoaded || !isSignedIn}
            >
              Pirkti kursą
            </button>
          </div>
        </div>
      </section>

      {/* Course Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-semibold text-stone-800">
                Apie kursą
              </h2>
              <div className="prose max-w-none text-stone-700">
                <p className="mb-4 text-lg leading-relaxed">
                  {riggingCourse.fullDescription}
                </p>
              </div>
            </div>

            {/* Course Features */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-semibold text-stone-800">
                Ko išmoksite
              </h2>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {riggingCourse.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
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
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Benefits */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-semibold text-stone-800">
                Kurso privalumai
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {riggingCourse.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white p-4 shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-4 font-semibold text-stone-800">
                      {benefit}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="rounded-lg bg-stone-100 p-8 text-center shadow-md">
              <h2 className="mb-4 text-2xl font-bold text-stone-800">
                Pasiruošę pradėti mokytis?
              </h2>
              <p className="mb-6 text-stone-600">
                Įsigykite šį kursą dabar ir pradėkite savo kelią į saugesnį
                darbą su kėlimo įranga
              </p>
              <button
                onClick={handleBuyCourse}
                className="rounded-md bg-stone-600 px-8 py-3 font-bold text-white transition hover:bg-stone-700"
                disabled={!isLoaded || !isSignedIn}
              >
                Pirkti kursą
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
