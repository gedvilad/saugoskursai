// components/Footer.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FooterProps {
  companyName: string;
  year: number;
  contactEmail?: string;
}

function Footer({ companyName, year, contactEmail }: FooterProps) {
  // State for accordion-style collapsible sections on mobile
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Effect for client-side only code
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Toggle function for mobile accordion sections
  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  // Determines if a section is expanded
  const isSectionOpen = (section: string) => openSection === section;

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-12">
          {/* Company info - Always expanded on all devices */}
          <div className="col-span-1 mb-6 md:mb-0">
            <h3 className="mb-4 text-lg font-bold text-white">{companyName}</h3>
            <p className="mb-4 text-sm text-gray-400">
              Profesionalūs saugos mokymai, kurie padės jums įgyti reikalingus
              įgūdžius ir žinias apie saugą darbe.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 transition-colors duration-200 hover:text-white"
                aria-label="Facebook"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors duration-200 hover:text-white"
                aria-label="LinkedIn"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation - Collapsible on mobile */}
          <div className="border-t border-gray-700 pt-4 md:border-t-0 md:pt-0">
            <button
              className="flex w-full items-center justify-between text-left md:hidden"
              onClick={() => toggleSection("nav")}
              aria-expanded={isSectionOpen("nav")}
              aria-controls="navigation-links"
            >
              <h3 className="text-md font-bold text-white">Navigacija</h3>
              <svg
                className={`h-5 w-5 transform text-gray-400 transition-transform duration-200 ${
                  isSectionOpen("nav") ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <h3 className="text-md mb-4 hidden font-bold text-white md:block">
              Navigacija
            </h3>
            <ul
              id="navigation-links"
              className={`mt-2 space-y-2 ${
                isSectionOpen("nav") ? "block" : "hidden"
              } md:block`}
            >
              <li>
                <Link
                  href="/"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  Pagrindinis
                </Link>
              </li>
              <li>
                <Link
                  href="/teorija"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  Teorija
                </Link>
              </li>
              <li>
                <Link
                  href="/testai"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  Testai
                </Link>
              </li>
              <li>
                <Link
                  href="/my-groups"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  Mano grupės
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional links - Collapsible on mobile */}
          <div className="border-t border-gray-700 pt-4 md:border-t-0 md:pt-0">
            <button
              className="flex w-full items-center justify-between text-left md:hidden"
              onClick={() => toggleSection("info")}
              aria-expanded={isSectionOpen("info")}
              aria-controls="info-links"
            >
              <h3 className="text-md font-bold text-white">Informacija</h3>
              <svg
                className={`h-5 w-5 transform text-gray-400 transition-transform duration-200 ${
                  isSectionOpen("info") ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <h3 className="text-md mb-4 hidden font-bold text-white md:block">
              Informacija
            </h3>
            <ul
              id="info-links"
              className={`mt-2 space-y-2 ${
                isSectionOpen("info") ? "block" : "hidden"
              } md:block`}
            >
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  Apie mus
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  Privatumo politika
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  Naudojimosi sąlygos
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 transition duration-200 hover:text-white"
                >
                  DUK
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - Collapsible on mobile */}
          <div className="border-t border-gray-700 pt-4 md:border-t-0 md:pt-0">
            <button
              className="flex w-full items-center justify-between text-left md:hidden"
              onClick={() => toggleSection("contact")}
              aria-expanded={isSectionOpen("contact")}
              aria-controls="contact-info"
            >
              <h3 className="text-md font-bold text-white">Susisiekite</h3>
              <svg
                className={`h-5 w-5 transform text-gray-400 transition-transform duration-200 ${
                  isSectionOpen("contact") ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <h3 className="text-md mb-4 hidden font-bold text-white md:block">
              Susisiekite
            </h3>
            <address
              id="contact-info"
              className={`mt-2 not-italic text-gray-400 ${
                isSectionOpen("contact") ? "block" : "hidden"
              } md:block`}
            >
              <p className="mb-2">Saugos g. 123</p>
              <p className="mb-2">LT-12345 Vilnius</p>
              <p className="mb-2">Lietuva</p>
              {contactEmail && (
                <p className="mb-2">
                  El. paštas:{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {contactEmail}
                  </a>
                </p>
              )}
              <p>
                Tel.:{" "}
                <a
                  href="tel:+37060000000"
                  className="text-gray-400 hover:text-white"
                >
                  +370 600 00000
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar - Improved for mobile */}
        <div className="border-t border-gray-700 py-6 text-center text-sm md:flex md:items-center md:justify-between md:text-left">
          <p className="mb-4 md:mb-0">
            &copy; {year} {companyName}. Visos teisės saugomos.
          </p>
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-6 md:space-y-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Privatumo politika
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Naudojimosi sąlygos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
