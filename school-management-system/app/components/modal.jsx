// components/SecondModal.js
"use client";

import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const SecondModal = ({ children, onClose }) => {
  useEffect(() => {
    // Disable scrolling on the body when modal is open
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    // Disable scrolling on the body when modal is open
    document.body.style.overflow = "hidden";

    // Add event listener for Escape key
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscapeKey);

    // Re-enable scrolling and remove event listener when component unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-41 h-full"
      style={{ margin: 0 }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-[75vw] max-h-[85vh] relative">
        {/* Fixed button outside of the scrollable content */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-51"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        {/* Scrollable content */}
        <div className="overflow-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};

export default SecondModal;
