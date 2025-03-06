// Footer.tsx
import React from "react";

interface FooterProps {
  companyName: string;
  year: number;
  contactEmail?: string; // Optional contact email
}

function Footer({ companyName, year, contactEmail }: FooterProps) {
  return (
    <footer className="mt-12 border-t border-gray-700 bg-gray-900 py-8 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <p className="text-lg font-medium">
              &copy; {year} {companyName}
            </p>
            <p className="text-sm">All rights reserved.</p>
          </div>
          <div>
            {contactEmail && (
              <p className="text-sm">
                Contact us:{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-blue-400 hover:underline"
                >
                  {contactEmail}
                </a>
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          {/* Add any additional links or information here */}
          <a href="#" className="mr-4 hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
