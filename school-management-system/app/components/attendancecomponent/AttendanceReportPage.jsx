// components/StudentAttendanceReportPage.js
"use client";

import React from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const AttendanceReportPage = ({ attendanceData }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <FaCheckCircle className="text-green-500" />;
      case "Absent":
        return <FaTimesCircle className="text-red-500" />;
      case "Late":
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* <h2 className="text-2xl font-bold text-cyan-700 mb-6">
        Student Attendance Report
      </h2> */}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        {/* <div className="px-4 py-5 sm:px-6">
          <h3 className="text-xl font-semibold text-cyan-600">
            {student.first_name} {student.last_name}'s Attendance
          </h3>
        </div> */}
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((record, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <FaCalendarAlt className="inline mr-2 text-cyan-500" />
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-2">{record.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.notes}
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

export default AttendanceReportPage;
