// components/semesters/editsemester.js
import React, { useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";

const EditSemester = ({ semester, onClose, onEdit }) => {
  const [name, setName] = useState(semester.name);
  const [startDate, setStartDate] = useState(semester.startDate);
  const [endDate, setEndDate] = useState(semester.endDate);
  const [status, setStatus] = useState(semester.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add API call to update semester
    onEdit();
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">Edit Semester</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-cyan-600 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-cyan-600 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-cyan-600 mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block text-cyan-600 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-cyan-700 text-white p-2 rounded hover:bg-cyan-600 flex items-center justify-center w-full"
        >
          <FaCalendarCheck className="mr-2" /> Update Semester
        </button>
      </form>
    </div>
  );
};

export default EditSemester;
