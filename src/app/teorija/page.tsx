"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const buttonBarRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section && buttonBarRef.current) {
      const buttonBarHeight = buttonBarRef.current.offsetHeight;
      const sectionPosition = section.getBoundingClientRect().top;
      const offsetPosition =
        sectionPosition + window.pageYOffset - buttonBarHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-gray-100 text-gray-900">
      {/* Fixed Navigation Bar */}
      <div
        className="fixed left-0 top-[45px] z-50 flex w-full justify-center gap-6 bg-white bg-opacity-90 p-4 shadow-md backdrop-blur-md"
        ref={buttonBarRef}
      >
        {["section1", "section2", "section3"].map((section) => (
          <a
            key={section}
            href={`#${section}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(section);
            }}
            className="rounded-lg bg-blue-500 px-5 py-2 text-white transition-all hover:bg-blue-600 active:scale-95"
          >
            {section.toUpperCase()}
          </a>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative mt-20 flex flex-col items-center space-y-16 p-6">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            id={`section${num}`}
            className="flex w-full max-w-4xl flex-col rounded-lg border border-gray-300 bg-white p-8 shadow-lg"
          >
            <h2 className="mb-6 border-b pb-4 text-3xl font-bold text-gray-800">
              Section {num}
            </h2>
            <div className="space-y-4 text-lg text-gray-700">
              <p className="leading-relaxed">
                Workplace safety is essential for preventing accidents and
                ensuring a secure environment. In this section, you will learn
                about fundamental safety measures.
              </p>
              <ul className="list-disc pl-5">
                <li>Understanding workplace hazards</li>
                <li>Proper use of safety equipment</li>
                <li>Emergency procedures</li>
              </ul>
              <div className="mt-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
                <strong>Tip:</strong> Always wear protective gear when handling
                hazardous materials.
              </div>
              {/* Example Image */}
              <div className="mt-6 flex flex-col items-center">
                <img
                  src="https://cdn11.bigcommerce.com/s-10c6f/product_images/uploaded_images/types-of-hazards.jpg"
                  alt="Example of safety procedure"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-md"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Example: Proper use of safety gear in the workplace.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
