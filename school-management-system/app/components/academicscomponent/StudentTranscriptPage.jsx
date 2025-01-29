// components/StudentTranscriptPage.js
"use client";

import React from "react";
import {
  FaGraduationCap,
  FaBook,
  FaCalendarAlt,
  FaCheck,
} from "react-icons/fa";

const StudentTranscriptPage = ({ student, transcriptData }) => {
  return (
    <div className="max-w-3xl mx-auto overflow-auto p-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-xl font-semibold text-cyan-600">
            {student?.last_name} {student?.first_name}'s Academic Transcript
          </h3>
        </div>
        {/* <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaGraduationCap className="mr-2 text-cyan-500" /> Current Grade
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {student.grade}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaBook className="mr-2 text-cyan-500" /> GPA
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {transcriptData.gpa.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div> */}
      </div>

      <div className="bg-white shadow overflow-auto sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-semibold text-cyan-600">
            Subject History
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {transcriptData.courses?.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    semester/term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transcriptData.courses.map((course, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <FaCalendarAlt className="inline mr-2 text-cyan-500" />
                      {course.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course?.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-4 text-sm text-gray-500">
              No subjects history available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTranscriptPage;
