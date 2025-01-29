// components/DisciplineRecordPage.js
"use client";

import React from "react";
import { FaExclamationCircle, FaCalendarAlt, FaUserTie } from "react-icons/fa";

const DisciplineRecordPage = ({ disciplineData }) => {
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "minor":
        return "text-yellow-500";
      case "moderate":
        return "text-orange-500";
      case "severe":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        {/* <div className="px-4 py-5 sm:px-6">
          <h3 className="text-xl font-semibold text-cyan-600">
            {student.first_name} {student.last_name}'s Discipline History
          </h3>
        </div> */}
        <div className="border-t border-gray-200">
          {disciplineData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Action Taken
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {disciplineData.map((record, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <FaCalendarAlt className="inline mr-2 text-cyan-500" />
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <FaExclamationCircle className="inline mr-2 text-cyan-500" />
                      {record.incident}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`${getSeverityColor(record.severity)}`}>
                        {record.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <FaUserTie className="inline mr-2 text-cyan-500" />
                      {record.actionTaken}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-4 text-sm text-gray-500">
              No discipline records found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisciplineRecordPage;
