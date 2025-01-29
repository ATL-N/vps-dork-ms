// components/semesters/semesterdetails.js
import React from "react";
import { FaCalendarAlt, FaBook, FaUsers } from "react-icons/fa";

const SemesterDetails = ({ semester, onClose }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">{semester.name} Details</h2>
      <div className="mb-4">
        <p className="flex items-center text-cyan-600">
          <FaCalendarAlt className="mr-2" /> Start Date: {semester.startDate}
        </p>
        <p className="flex items-center text-cyan-600 mt-2">
          <FaCalendarAlt className="mr-2" /> End Date: {semester.endDate}
        </p>
      </div>
      <div className="mb-4">
        <p className="flex items-center text-cyan-600">
          <FaBook className="mr-2" /> Courses: {semester.courseCount}
          </p>
         <p className="flex items-center text-cyan-600 mt-2">
          <FaUsers className="mr-2" /> Students: {semester.studentCount}
        </p>
      </div>
      <div className="mb-4">
        <p className="text-cyan-600">Status: <span className={`font-bold ${semester.status === 'Active' ? 'text-green-500' : semester.status === 'Upcoming' ? 'text-blue-500' : 'text-red-500'}`}>{semester.status}</span></p>
      </div>
      <button onClick={onClose} className="bg-cyan-700 text-white p-2 rounded hover:bg-cyan-600 w-full">
        Close
      </button>
    </div>
  );
};

export default SemesterDetails;