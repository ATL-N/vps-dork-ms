"use client";
import React, { useEffect } from "react";
import { FaUsers } from "react-icons/fa";

const Studentparentrelationship = ({
  formData,
  handleChange,
  parentIndex,
  isDetails = false,
}) => {
  const prefix = `parent${parentIndex + 1}`; // Dynamically create field names
  // useEffect(() => {
  //     console.log("Studentparentrelationship parentIndex", parentIndex, prefix);
    
  // }, []);
  // console.log("Studentparentrelationship parentIndex", parentIndex);
  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700 mb-1"
        htmlFor={`${prefix}_relationship`}
      >
        Relationship
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaUsers className="text-gray-400" />
        </div>
        <input
          type="text"
          name={`${prefix}_relationship`}
          id={`${prefix}_relationship`}
          required={parentIndex === 0}
          className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="e.g. Mother, Father, Guardian"
          value={formData[`${prefix}_relationship`]}
          onChange={handleChange}
          readOnly={isDetails}
        />
      </div>
    </div>
  );
};

export default Studentparentrelationship;
