import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => {
  return <div className={`px-4 py-5 sm:px-6 ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`px-4 py-5 sm:p-6 ${className}`}>{children}</div>;
};

export const Progress = ({ value, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 mb-4 ${className}`}>
      <div
        className="bg-cyan-600 h-2.5 rounded-full"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
