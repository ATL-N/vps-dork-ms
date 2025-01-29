// pages/dashboard/departments/assigndepartmenthead.js (continued)
import React, { useState, useEffect } from "react";

const AssignDepartmentHead = ({ department, onClose, onAssign }) => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    // Replace with actual API call
    const data = [
      { id: 1, name: "Dr. John Doe" },
      { id: 2, name: "Prof. Jane Smith" },
      { id: 3, name: "Dr. Alice Johnson" },
      { id: 4, name: "Prof. Bob Wilson" },
    ];
    setStaffList(data);
  };

  const handleChange = (e) => {
    setSelectedStaff(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add API call to assign department head
    onAssign();
    onClose();
  };

  return (
    <div className="assign-head px-4 py-8 bg-white rounded shadow-md text-cyan-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Assign Department Head
      </h2>
      <p className="text-gray-700 mb-4">
        Assigning head for:  <strong>{ department.name}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="staff"
          >
            Select Staff Member
          </label>
          <select
            id="staff"
            name="staff"
            value={selectedStaff}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select a staff member</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
          >
            Assign Head
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignDepartmentHead;
