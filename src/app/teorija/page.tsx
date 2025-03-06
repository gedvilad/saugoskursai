"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["section1", "section2", "section3"];
      for (const id of sections) {
        const section = document.getElementById(id);
        if (
          section &&
          section.getBoundingClientRect().top <= 100 &&
          section.getBoundingClientRect().bottom >= 100
        ) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative mt-8">
      {/* Page Sections */}
      <div className="scroll-smooth pt-16">
        <div
          id="section1"
          className="m-8 flex items-center justify-center bg-red-200"
        >
          <h2 className="text-3xl font-bold">Section 1</h2>
        </div>
        <div
          id="section2"
          className="m-8 flex h-screen items-center justify-center bg-green-200"
        >
          <h2 className="text-3xl font-bold">Section 2</h2>
        </div>
        <div
          id="section3"
          className="m-8 flex h-screen items-center justify-center bg-blue-200"
        >
          <h2 className="text-3xl font-bold">Section 3</h2>
        </div>
      </div>
    </div>
  );
}
