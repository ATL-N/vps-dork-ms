// pages/dashboard/settings/academic-year.js
"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";

const AcademicYearSettings = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [newYear, setNewYear] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Fetch academic years from API
    // Replace with actual API call
    const fetchedYears = [
      {
        id: 1,
        name: "2023-2024",
        startDate: "2023-09-01",
        endDate: "2024-06-30",
      },
      {
        id: 2,
        name: "2024-2025",
        startDate: "2024-09-01",
        endDate: "2025-06-30",
      },
    ];
    setAcademicYears(fetchedYears);
  }, []);

  const handleNewYearChange = (e) => {
    const { name, value } = e.target;
    setNewYear((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddYear = () => {
    // Add new academic year to API
    const newId = academicYears.length + 1;
    setAcademicYears((prev) => [...prev, { id: newId, ...newYear }]);
    setNewYear({ name: "", startDate: "", endDate: "" });
  };

  const handleDeleteYear = (id) => {
    // Delete academic year from API
    setAcademicYears((prev) => prev.filter((year) => year.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit updated academic years to API
    console.log("Submitting academic years:", academicYears);
    // Add API call here
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Academic Year Settings25
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Current Academic Years
        </h2>
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Start Date</th>
              <th className="p-2 text-left">End Date</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {academicYears.map((year) => (
              <tr key={year.id} className="border-b">
                <td className="p-2">{year.name}</td>
                <td className="p-2">{year.startDate}</td>
                <td className="p-2">{year.endDate}</td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteYear(year.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Add New Academic Year
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            name="name"
            value={newYear.name}
            onChange={handleNewYearChange}
            placeholder="Year Name (e.g., 2025-2026)"
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="startDate"
            value={newYear.startDate}
            onChange={handleNewYearChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="endDate"
            value={newYear.endDate}
            onChange={handleNewYearChange}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="mb-4 mr-6 p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
          >
            <FaSave className="mr-2" /> Save Changes
          </button>
          <button
            type="button"
            onClick={handleAddYear}
            className="mb-4 p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
          >
            <FaPlus className="mr-2" /> Add Year
          </button>
        </div>
      </form>
    </div>
  );
};

export default AcademicYearSettings;
