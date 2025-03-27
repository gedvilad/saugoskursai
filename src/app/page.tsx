// app/page.tsx
import React from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero & About Us Section */}
      <section
        className="py-20 text-white"
        style={{
          backgroundImage: `url(${"https://wallpapers.com/images/hd/silhouette-construction-workers-zbf1w86pg3o3730z.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.85,
        }}
      >
        <div className="container mx-auto">
          {/* Hero Section Content */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">
              Tavo kelias į saugią darbo aplinką
            </h1>
            <p className="mb-8 text-lg"></p>
            <button className="rounded-md bg-white px-6 py-3 font-bold text-blue-600 hover:bg-blue-100">
              Apžvelgti kursus
            </button>
          </div>

          {/* About Us Section Content */}
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-semibold text-white">
                (Mūsų komandą)
              </h2>
              <h3 className="mb-6 text-3xl font-semibold text-white">
                nuotrauka
              </h3>
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-semibold text-white">
                Apie mus
              </h2>
              <p className="mb-4 leading-relaxed">Mes siūlome ...</p>
              <ul className="list-disc pl-5">
                <li>a</li>
                <li>b</li>
                <li>c</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Overview Section */}
      <section className="bg-gray-200 py-12">
        <div className="container mx-auto">
          <h2 className="mb-6 text-center text-3xl font-semibold text-gray-800">
            Siūlomi kursai
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Course Card 1 */}
            <div className="rounded-md bg-white p-4 shadow-md">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">a</h3>
              <p className="text-gray-700">Info</p>
              <button className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-700">
                Plačiau
              </button>
            </div>

            {/* Course Card 2 */}
            <div className="rounded-md bg-white p-4 shadow-md">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">b</h3>
              <p className="text-gray-700">Info</p>
              <button className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-700">
                Plačiau
              </button>
            </div>

            {/* Course Card 3 */}
            <div className="rounded-md bg-white p-4 shadow-md">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">c</h3>
              <p className="text-gray-700">Info</p>
              <button className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-700">
                Plačiau
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
