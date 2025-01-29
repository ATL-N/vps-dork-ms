// components/DailyClassAttendancePage.js
"use client";

import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaSave,
} from "react-icons/fa";

const DailyClassAttendancePage = ({ classInfo, students, date }) => {
  const [attendance, setAttendance] = useState(
    students.map((student) => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      status: "",
      notes: "",
    }))
  );

  const handleStatusChange = (id, status) => {
    setAttendance((prev) =>
      prev.map((record) => (record.id === id ? { ...record, status } : record))
    );
  };

  const handleNotesChange = (id, notes) => {
    setAttendance((prev) =>
      prev.map((record) => (record.id === id ? { ...record, notes } : record))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the attendance data to your backend
    console.log("Submitting attendance:", attendance);
    // You could also show a success message or redirect after submission
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <FaUserCheck className="text-green-500" />;
      case "Absent":
        return <FaUserTimes className="text-red-500" />;
      case "Late":
        return <FaUserClock className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-cyan-700 mb-6">
        Daily Class Attendance
      </h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-cyan-600">
            {classInfo.name} - Attendance for {date}
          </h3>
          <FaCalendarAlt className="text-cyan-500 text-xl" />
        </div>

        <form onSubmit={handleSubmit}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record, index) => (
                <tr
                  key={record.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-4">
                      {["Present", "Absent", "Late"].map((status) => (
                        <label
                          key={status}
                          className="inline-flex items-center"
                        >
                          <input
                            type="radio"
                            className="form-radio text-cyan-600"
                            name={`status-${record.id}`}
                            value={status}
                            checked={record.status === status}
                            onChange={() =>
                              handleStatusChange(record.id, status)
                            }
                          />
                          <span className="ml-2">{getStatusIcon(status)}</span>
                          <span className="ml-1">{status}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="text"
                      value={record.notes}
                      onChange={(e) =>
                        handleNotesChange(record.id, e.target.value)
                      }
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                      placeholder="Add notes"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50 text-right">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <FaSave className="mr-2" /> Save Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyClassAttendancePage;
