"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUserPlus, FaSearch } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [isEditingDepartment, setIsEditingDepartment] = useState(false);
  const [isAssigningHead, setIsAssigningHead] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchStaff();
  }, []);

  const fetchDepartments = async () => {
    // Simulated API call
    const dummyDepartments = [
      {
        id: 1,
        name: "Mathematics",
        description: "Math department",
        headId: 1,
        staffCount: 10,
        studentCount: 150,
      },
      {
        id: 2,
        name: "Science",
        description: "Science department",
        headId: 2,
        staffCount: 12,
        studentCount: 180,
      },
      {
        id: 3,
        name: "English",
        description: "English department",
        headId: 3,
        staffCount: 8,
        studentCount: 160,
      },
    ];
    setDepartments(dummyDepartments);
  };

  const fetchStaff = async () => {
    // Simulated API call
    const dummyStaff = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Bob Johnson" },
    ];
    setStaff(dummyStaff);
  };

  const handleAddDepartment = () => {
    const newId = departments.length + 1;
    setDepartments([
      ...departments,
      { ...newDepartment, id: newId, staffCount: 0, studentCount: 0 },
    ]);
    setNewDepartment({ name: "", description: "" });
    setIsAddingDepartment(false);
  };

  const handleEditDepartment = () => {
    const updatedDepartments = departments.map((dept) =>
      dept.id === selectedDepartment.id ? selectedDepartment : dept
    );
    setDepartments(updatedDepartments);
    setIsEditingDepartment(false);
  };

  const handleDeleteDepartment = (id) => {
    setDepartments(departments.filter((dept) => dept.id !== id));
  };

  const handleAssignHead = (staffId) => {
    const updatedDepartments = departments.map((dept) =>
      dept.id === selectedDepartment.id ? { ...dept, headId: staffId } : dept
    );
    setDepartments(updatedDepartments);
    setIsAssigningHead(false);
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = departments.map((dept) => ({
    name: dept.name,
    staffCount: dept.staffCount,
    studentCount: dept.studentCount,
  }));

  return (
    <div className="space-y-6 text-cyan-800 pb-16">
      <h2 className="text-2xl font-bold text-cyan-700">
        Department Management
      </h2>

      {/* Department List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Department List</h3>
          <button
            onClick={() => setIsAddingDepartment(true)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Department
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-cyan-300 rounded-md p-2"
          />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-cyan-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Head</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => (
              <tr key={dept.id} className="border-b">
                <td className="p-2">{dept.name}</td>
                <td className="p-2">{dept.description}</td>
                <td className="p-2">
                  {staff.find((s) => s.id === dept.headId)?.name ||
                    "Not assigned"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsEditingDepartment(true);
                    }}
                    className="mr-2 text-cyan-600 hover:text-cyan-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="mr-2 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsAssigningHead(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaUserPlus />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Department Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Department Statistics</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="staffCount" fill="#8884d8" name="Staff Count" />
              <Bar dataKey="studentCount" fill="#82ca9d" name="Student Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add New Department Modal */}
      {isAddingDepartment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
            <input
              type="text"
              placeholder="Department Name"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              className="w-full border-2 border-cyan-300 rounded-md p-2 mb-2"
            />
            <textarea
              placeholder="Department Description"
              value={newDepartment.description}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  description: e.target.value,
                })
              }
              className="w-full border-2 border-cyan-300 rounded-md p-2 mb-4"
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingDepartment(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {isEditingDepartment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Edit Department</h3>
            <input
              type="text"
              value={selectedDepartment.name}
              onChange={(e) =>
                setSelectedDepartment({
                  ...selectedDepartment,
                  name: e.target.value,
                })
              }
              className="w-full border-2 border-cyan-300 rounded-md p-2 mb-2"
            />
            <textarea
              value={selectedDepartment.description}
              onChange={(e) =>
                setSelectedDepartment({
                  ...selectedDepartment,
                  description: e.target.value,
                })
              }
              className="w-full border-2 border-cyan-300 rounded-md p-2 mb-4"
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditingDepartment(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleEditDepartment}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Department Head Modal */}
      {isAssigningHead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">
              Assign Department Head
            </h3>
            <select
              onChange={(e) => handleAssignHead(parseInt(e.target.value))}
              className="w-full border-2 border-cyan-300 rounded-md p-2 mb-4"
            >
              <option value="">Select a staff member</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={() => setIsAssigningHead(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
