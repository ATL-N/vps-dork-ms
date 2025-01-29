"use client";

import React from "react";
import {
  FaBuilding,
  FaUserTie,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";

const DepartmentDetailsPage = ({ departmentData, showBtns = true }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600">
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
        {departmentData.department_name} Details
      </h2>

      <div className="space-y-6">
        <div className="flex items-center">
          <FaBuilding className="text-2xl mr-4" />
          <div>
            <h3 className="font-semibold">Department Name</h3>
            <p>{departmentData.department_name}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaUserTie className="text-2xl mr-4" />
          <div>
            <h3 className="font-semibold">Head of Department</h3>
            <p>{departmentData.head_of_department}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaUsers className="text-2xl mr-4" />
          <div>
            <h3 className="font-semibold">Number of Staff</h3>
            <p>{departmentData.number_of_staff}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaCalendarAlt className="text-2xl mr-4" />
          <div>
            <h3 className="font-semibold">Established Date</h3>
            <p>{departmentData.established_date}</p>
          </div>
        </div>
      </div>

      {showBtns && (
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => handleEditDepartment(departmentData.id)}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            Edit Department
          </button>
          <button
            onClick={() => handleDeleteDepartment(departmentData.id)}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Delete Department
          </button>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetailsPage;