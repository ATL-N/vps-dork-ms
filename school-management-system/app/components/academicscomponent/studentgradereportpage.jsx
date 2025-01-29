// components/GradeReportPage.js
"use client";

import React from "react";
import { FaBook, FaChartBar } from "react-icons/fa";

const GradeReportPage = ({ student, gradeData }) => {
  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-500";
    if (grade >= 80) return "text-blue-500";
    if (grade >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-cyan-700 mb-6">
        Student Grade Report
      </h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-xl font-semibold text-cyan-600">
            {student.first_name} {student.last_name}'s Grades
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gradeData.map((record, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <FaBook className="inline mr-2 text-cyan-500" />
                    {record.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span
                      className={`flex items-center ${getGradeColor(
                        record.grade
                      )}`}
                    >
                      <FaChartBar className="mr-2" />
                      {record.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.comments}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeReportPage;
