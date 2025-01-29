// pages/dashboard/departments/editdepartment.js
import React, { useState, useEffect } from "react";

const EditDepartment = ({ department, onClose, onEdit }) => {
  const [formData, setFormData] = useState({
    name: department.name,
    description: department.description || "",
    headId: department.headId || "",
  });
  const [staffList, setStaffList] = useState([]);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add API call to update department
    onEdit();
    onClose();
  };

  return (
    <div className="text-cyan-500">
      <h2 className="text-xl font-bold mb-4 text-cyan-700">Edit Department</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Department Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className=" shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="max-h-16 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          ></textarea>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="headId"
          >
            Department Head
          </label>
          <select
            id="headId"
            name="headId"
            value={formData.headId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-white leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a department head</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
          >
            Update Department
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;
