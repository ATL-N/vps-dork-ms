"use client";
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaChalkboardTeacher,
  FaBookReader,
  FaMapMarkerAlt,
  FaPlusCircle,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

const Teacherschedulepage = ({
  teacherData,
  initialSchedule,
  onAddClass,
  onEditClass,
  onDeleteClass,
  showStaffDet = true,
}) => {


  const [schedule, setSchedule] = useState(initialSchedule);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    day: "Monday",
    startTime: "",
    endTime: "",
    subject: "",
    class: "",
    room: "",
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    setSchedule(initialSchedule);
  }, [initialSchedule]);

  const handleAddClass = (e) => {
    e.preventDefault();
    onAddClass(newClass);
    setShowAddModal(false);
    setNewClass({
      day: "Monday",
      startTime: "",
      endTime: "",
      subject: "",
      class: "",
      room: "",
    });
  };

  const handleDeleteClass = (classToDelete) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      onDeleteClass(classToDelete);
    }
  };

  return (
    <div className="space-y-6 text-cyan-800 pb-16">
      <h2 className="text-2xl font-bold text-cyan-700 mb-6">
        Teacher Schedule
      </h2>

      {/* Teacher Information section */}
      {showStaffDet && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-cyan-600 mb-4">
            Teacher Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <FaUser className="text-cyan-500 mr-2" />
              <span>Name: {teacherData.name}</span>
            </div>
            <div className="flex items-center">
              <FaChalkboardTeacher className="text-cyan-500 mr-2" />
              <span>Subject: {teacherData.subject}</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule section */}
      {schedule?.length ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-cyan-600">
              Class Schedule
            </h3>
            {showStaffDet && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                <FaPlusCircle className="mr-2" />
                Add Class
              </button>
            )}
          </div>

          {/* Day selector */}
          <div className="flex mb-4 space-x-2 overflow-x-auto">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-md ${
                  selectedDay === day
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Classes for selected day */}
          <div className="space-y-4">
            {schedule
              .filter((classItem) => classItem.day === selectedDay)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((classItem, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-lg">
                      {classItem.subject}
                    </div>
                    <div className="text-gray-600">
                      <span className="flex items-center">
                        <FaClock className="mr-2" />
                        {classItem.startTime} - {classItem.endTime}
                      </span>
                      <span className="flex items-center">
                        <FaBookReader className="mr-2" />
                        Class: {classItem.class}
                      </span>
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        Room: {classItem.room}
                      </span>
                    </div>
                  </div>
                  {/* <div className="space-x-2">
                    <button
                      onClick={() => onEditClass(classItem)}
                      title="edit"
                      className="p-2 text-cyan-800 hover:text-cyan-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem)}
                      className="p-2 text-red-600 hover:text-red-900"
                    >
                      <FaTrashAlt />
                    </button>
                  </div> */}
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div>
          <p>
            No schedule(s) available for this staff.{" "}
            <b>All schedules is displayed here</b>
          </p>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white h-[75vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-cyan-600 mb-4">
              Add New Class
            </h3>
            <form onSubmit={handleAddClass}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="day"
                >
                  Day
                </label>
                <select
                  id="day"
                  name="day"
                  value={newClass.day}
                  onChange={(e) =>
                    setNewClass({ ...newClass, day: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="startTime"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={newClass.startTime}
                  onChange={(e) =>
                    setNewClass({ ...newClass, startTime: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="endTime"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={newClass.endTime}
                  onChange={(e) =>
                    setNewClass({ ...newClass, endTime: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="subject"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={newClass.subject}
                  onChange={(e) =>
                    setNewClass({ ...newClass, subject: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="class"
                >
                  Class
                </label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={newClass.class}
                  onChange={(e) =>
                    setNewClass({ ...newClass, class: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="room"
                >
                  Room
                </label>
                <input
                  type="text"
                  id="room"
                  name="room"
                  value={newClass.room}
                  onChange={(e) =>
                    setNewClass({ ...newClass, room: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  title="cancel"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  title="Add class"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacherschedulepage;
