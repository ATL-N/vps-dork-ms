// components/Footer.js
import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-cyan-800 text-white py-2 px-6 fixed bottom-0 right-0 left-0 md:left-16 z-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm">
            &copy; 2024 School Management System. All rights reserved.
          </p>
        </div>
        <nav className="flex space-x-4">
          <Link
            href="/pages/privacy-policy"
            className="text-sm hover:text-cyan-300 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            href="/pages/terms-of-service"
            className="text-sm hover:text-cyan-300 transition-colors duration-200"
          >
            Terms of Service
          </Link>
          <Link
            href="/pages/contact"
            className="text-sm hover:text-cyan-300 transition-colors duration-200"
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
