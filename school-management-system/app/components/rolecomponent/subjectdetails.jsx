'use client'
import React, { useState } from "react";
import {
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaEdit,
} from "react-icons/fa";

const Subjectdetailspage = ({ courseData, onEdit }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedCourse, setEditedCourse] = useState({ ...courseData });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(editedCourse);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6 text-cyan-800 overflow-auto h-[70vh]">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-700">Course Details</h2>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          <FaEdit className="mr-2" />
          Edit Course
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <FaBook className="text-cyan-500 mr-3" size={24} />
              <div>
                <h3 className="font-semibold text-lg">{courseData.name}</h3>
                <p className="text-gray-600">{courseData.code}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaChalkboardTeacher className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Instructor</h4>
                <p>{courseData.instructor}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaUsers className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Enrollment</h4>
                <p>
                  {courseData.enrolledStudents} / {courseData.maxCapacity}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <FaCalendarAlt className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Schedule</h4>
                <p>{courseData.schedule}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaClock className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Duration</h4>
                <p>{courseData.duration}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaClipboardList className="text-cyan-500 mr-3" size={24} />
              <div>
                <h4 className="font-semibold">Credits</h4>
                <p>{courseData.credits}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-2">Description</h4>
          <p className="text-gray-700">{courseData.description}</p>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold text-cyan-600 mb-4">
              Edit Course
            </h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="name"
                >
                  Course Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedCourse.name}
                  onChange={(e) =>
                    setEditedCourse({ ...editedCourse, name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              {/* Add more form fields for other course details */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjectdetailspage;
