// pages/dashboard/departments/departmentdetails.js
import React from "react";
import { FaUserTie, FaUsers, FaUserGraduate } from "react-icons/fa";

const DepartmentDetails = ({ department, onClose }) => {
  return (
    <div className="department-details px-4 py-8 bg-white rounded shadow-md text-cyan-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {department.name} Department Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="mb-4 md:mb-0">
          <p className="font-medium text-gray-700 mb-1">Description:</p>
          <p>{department.description || "No description available."}</p>
        </div>
        <div className="flex items-center space-x-4">
          <FaUserTie className="text-cyan-500 text-2xl" />
          <div>
            <p className="font-medium text-gray-700">Department Head:</p>
            <p >{department.head}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <FaUsers className="text-cyan-500 text-2xl" />
          <div>
            <p className="font-medium text-gray-700">Staff Count:</p>
            <p>{department.staffCount}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <FaUserGraduate className="text-cyan-500 text-2xl" />
          <div>
            <p className="font-medium text-gray-700">Student Count:</p>
            <p>{department.studentCount}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DepartmentDetails;
