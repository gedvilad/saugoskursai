// components/Footer.tsx
import React from "react";
import Link from "next/link";

interface FooterProps {
  companyName: string;
  year: number;
  contactEmail?: string;
}

function Footer({ companyName, year, contactEmail }: FooterProps) {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-4">
          {/* Company info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="mb-4 text-lg font-bold text-white">{companyName}</h3>
            <p className="mb-4 text-sm text-gray-400">
              Profesionalūs saugos mokymai, kurie padės jums įgyti reikalingus
              įgūdžius ir žinias apie saugą darbe.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
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
              <a href="#" className="text-gray-400 hover:text-white">
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

          {/* Navigation */}
          <div>
            <h3 className="text-md mb-4 font-bold text-white">Navigacija</h3>
            <ul className="space-y-2">
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

          {/* Additional links */}
          <div>
            <h3 className="text-md mb-4 font-bold text-white">Informacija</h3>
            <ul className="space-y-2">
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

          {/* Contact */}
          <div>
            <h3 className="text-md mb-4 font-bold text-white">Susisiekite</h3>
            <address className="not-italic text-gray-400">
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
              <p>Tel.: +370 600 00000</p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 py-4 text-center text-sm md:flex md:justify-between md:text-left">
          <p>
            &copy; {year} {companyName}. Visos teisės saugomos.
          </p>
          <div className="mt-2 md:mt-0">
            <Link
              href="/privacy"
              className="mr-4 text-gray-400 hover:text-white"
            >
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
