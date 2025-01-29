// components/StudentReportCardPage.js
"use client";

import React from "react";
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaBook,
  FaChartLine,
} from "react-icons/fa";

const StudentReportCardPage = ({ student, reportCardData }) => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-xl font-semibold text-cyan-600">
            {student.name}'s Semester Report Card
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaUserGraduate className="mr-2 text-cyan-500" /> Grade
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {student.grade}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaCalendarAlt className="mr-2 text-cyan-500" /> Semester
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {reportCardData.semester}
              </dd>
            </div>
          </dl>
        </div>
      </div> */}

      <div className="bg-white shadow overflow-auto sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-semibold text-cyan-600">
            Subjects Grades For Current term {reportCardData?.semester}
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {reportCardData?.courses?.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Class Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Exams Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportCardData.courses.map((course, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <FaBook className="inline mr-2 text-cyan-500" />
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.class_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.exams_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.comments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-4 text-sm text-gray-500">
              No courses found for this semester.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-semibold text-cyan-600">
            Overall Performance
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {/* <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaChartLine className="mr-2 text-cyan-500" /> GPA This Semester
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {reportCardData.semesterGPA.toFixed(2)}
              </dd>
            </div> */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Teacher's Remark
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {reportCardData?.teacherNote}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StudentReportCardPage;
