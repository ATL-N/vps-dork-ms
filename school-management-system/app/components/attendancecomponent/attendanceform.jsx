"use client";
import React from "react";
import {
  FaUserCheck,
  FaCalendarAlt,
  FaSave,
  FaUndo,
  FaSearch,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

const AttendanceForm = ({
  students,
  classes,
  onSubmit,
  mode,
  selectedClass,
  setSelectedClass,
  selectedDate,
  setSelectedDate,
  attendance,
  handleAttendanceChange,
  handleReset,
  isAttendanceAllowed,
  loading,
}) => {
  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">
        {mode === "take" ? "Take Attendance" : "Edit Attendance"}
      </h2>
      {mode === "take" && !isAttendanceAllowed && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p className="font-bold">Attention</p>
          <p>
            Attendance can only be taken on weekdays after 7 and before 14:00 pm. You can
            view but not submit attendance at this time.
          </p>
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-semibold">Select Class</label>
              <select
                className="w-full border-2 border-cyan-300 rounded-md p-3 bg-white"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                disabled={mode === "edit"}
              >
                <option value="">Select a class</option>
                {classes?.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold">Date</label>
              <input
                type="date"
                className="w-full border-2 border-cyan-300 rounded-md p-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={mode === "edit"}
                readOnly
              />
            </div>
          </div>
          {selectedClass && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cyan-700 text-white">
                    <th className="p-2 text-left">Student</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(
                      (student) => student.class_id === parseInt(selectedClass)
                    )
                    .map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center">
                            <FaUserCheck
                              className="text-cyan-500 mr-2"
                              size={18}
                            />
                            <div>
                              <p className="font-semibold">{student.name}</p>
                              <p className="text-sm text-gray-600">
                                {student.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-4">
                            {["present", "absent", "late"].map((status) => (
                              <label
                                key={status}
                                className="inline-flex items-center"
                              >
                                <input
                                  type="radio"
                                  name={`attendance-${student.id}`}
                                  value={status}
                                  checked={attendance[student.id] === status}
                                  onChange={() =>
                                    handleAttendanceChange(student.id, status)
                                  }
                                  className="mr-1 size-5"
                                />
                                <span className="mx-1">
                                  <FaUserCheck
                                    className={`text-${
                                      status === "present"
                                        ? "green"
                                        : status === "absent"
                                        ? "red"
                                        : "yellow"
                                    }-500`}
                                  />
                                </span>
                                <span className="mr-2 capitalize">
                                  {status}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
            >
              <FaUndo className="mr-2" />
              Reset
            </button>
            <button
              type="submit"
              disabled={(mode === "take" && !isAttendanceAllowed) || loading}
              className={`px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center ${
                ((mode === "take" && !isAttendanceAllowed) || loading) &&
                "opacity-50 cursor-not-allowed"
              }`}
            >
              <FaSave className="mr-2" />
              {loading
                ? "Submitting..."
                : mode === "take"
                ? "Save Attendance"
                : "Update Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
