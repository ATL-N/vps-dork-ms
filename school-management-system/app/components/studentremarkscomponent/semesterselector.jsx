// components/semester-selector.js
import React from "react";

const SemesterSelector = ({ selectedSemester, onSelectSemester }) => {
  const semesters = ["1", "2", "3"];

  return (
    <div className="flex items-center">
      <span className="mr-2 text-cyan-700 font-semibold">Semester:</span>
      <select
        value={selectedSemester}
        onChange={(e) => onSelectSemester(e.target.value)}
        className="border rounded py-1 px-2 text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        {semesters.map((semester) => (
          <option key={semester} value={semester}>
            {semester}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SemesterSelector;
