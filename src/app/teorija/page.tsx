"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef } from "react";

export default function Home() {
  const buttonBarRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section && buttonBarRef.current) {
      const buttonBarHeight = buttonBarRef.current.offsetHeight;

      const sectionPosition = section.getBoundingClientRect().top;
      const offsetPosition =
        sectionPosition + window.pageYOffset - buttonBarHeight - 70;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div>
      <div
        className="fixed left-0 top-[45px] z-40 mb-4 flex w-full gap-4 bg-white p-4 shadow-md"
        ref={buttonBarRef}
      >
        {["section1", "section2", "section3"].map((section) => (
          <a
            key={section}
            href={`#${section}`}
            onClick={(e) => {
              e.preventDefault(); // Prevent default anchor behavior
              scrollToSection(section);
            }}
            className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
          >
            {section.toUpperCase()}
          </a>
        ))}
      </div>
      <div className="relative mt-8">
        <div className="scroll-smooth pt-16">
          <div
            id="section1"
            className="m-8 flex items-center justify-center border-2 border-gray-200"
          >
            <h2 className="text-3xl font-bold">Section 1</h2>
          </div>
          <div
            id="section2"
            className="m-8 flex h-screen items-center justify-center border-2 border-gray-200"
          >
            <h2 className="text-3xl font-bold">Section 2</h2>
          </div>
          <div
            id="section3"
            className="m-8 flex items-center justify-center border-2 border-gray-200"
          >
            <h2 className="text-3xl font-bold">Section 3</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
