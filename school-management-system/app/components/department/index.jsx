// pages/dashboard/departments/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaUserPlus,
  FaEdit,
  FaInfoCircle,
  FaUserTie,
  FaChartBar,
} from "react-icons/fa";
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
import StatCard from "../statcard";
import Modal from "../modal/modal";
import AddNewDepartment from "./addnewdepartment";
import EditDepartment from "./editdepartment";
import DepartmentDetails from "./departmentdetails";
import AssignDepartmentHead from "./assigndepartmenthead";

const DepartmentManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchDepartmentStats();
  }, []);

  const fetchDepartments = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        name: "Mathematics",
        head: "Dr. John Doe",
        staffCount: 15,
        studentCount: 300,
      },
      {
        id: 2,
        name: "Science",
        head: "Prof. Jane Smith",
        staffCount: 20,
        studentCount: 350,
      },
      {
        id: 3,
        name: "English",
        head: "Dr. Alice Johnson",
        staffCount: 18,
        studentCount: 320,
      },
      {
        id: 4,
        name: "History",
        head: "Prof. Bob Wilson",
        staffCount: 12,
        studentCount: 280,
      },
      {
        id: 5,
        name: "Nelson",
        head: "Prof. Bob Wilson",
        staffCount: 12,
        studentCount: 280,
      },
      {
        id: 1,
        name: "Mathematics",
        head: "Dr. John Doe",
        staffCount: 15,
        studentCount: 300,
      },
      {
        id: 2,
        name: "Science",
        head: "Prof. Jane Smith",
        staffCount: 20,
        studentCount: 350,
      },
      {
        id: 3,
        name: "English",
        head: "Dr. Alice Johnson",
        staffCount: 18,
        studentCount: 320,
      },
      {
        id: 4,
        name: "History",
        head: "Prof. Bob Wilson",
        staffCount: 12,
        studentCount: 280,
      },
      {
        id: 5,
        name: "Nelson",
        head: "Prof. Bob Wilson",
        staffCount: 12,
        studentCount: 280,
      },
    ];
    setDepartments(data);
  };

  const fetchDepartmentStats = async () => {
    // Replace with actual API call
    const data = [
      { name: "Mathematics", staffCount: 15, studentCount: 300 },
      { name: "Science", staffCount: 20, studentCount: 350 },
      { name: "English", staffCount: 18, studentCount: 320 },
      { name: "History", staffCount: 12, studentCount: 280 },
      { name: "nelson", staffCount: 12, studentCount: 280 },
    ];
    setDepartmentStats(data);
  };

  const handleAddDepartment = () => {
    setModalContent(
      <AddNewDepartment
        onClose={() => setShowModal(false)}
        onAdd={fetchDepartments}
      />
    );
    setShowModal(true);
  };

  const handleEditDepartment = (department) => {
    setModalContent(
      <EditDepartment
        department={department}
        onClose={() => setShowModal(false)}
        onEdit={fetchDepartments}
      />
    );
    setShowModal(true);
  };

  const handleDepartmentDetails = (department) => {
    setModalContent(
      <DepartmentDetails
        department={department}
        onClose={() => setShowModal(false)}
      />
    );
    setShowModal(true);
  };

  const handleAssignHead = (department) => {
    setModalContent(
      <AssignDepartmentHead
        department={department}
        onClose={() => setShowModal(false)}
        onAssign={fetchDepartments}
      />
    );
    setShowModal(true);
  };

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Department Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaBuilding />}
            title="Total Departments"
            value={departments.length}
          />
          <StatCard
            icon={<FaUserTie />}
            title="Department Heads"
            value={departments.length}
          />
          <StatCard
            icon={<FaChartBar />}
            title="Avg. Staff per Dept"
            value={(
              departments.reduce((acc, dept) => acc + dept.staffCount, 0) /
              departments.length
            ).toFixed(1)}
          />
          <StatCard
            icon={<FaChartBar />}
            title="Avg. Students per Dept"
            value={(
              departments.reduce((acc, dept) => acc + dept.studentCount, 0) /
              departments.length
            ).toFixed(1)}
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Department List
            </h2>
            <button
              onClick={handleAddDepartment}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
            >
              <FaUserPlus className="mr-2" /> Add New Department
            </button>
          </div>
          <div className="overflow-x-auto tableWrap height-45vh">
            <table className="w-full table-auto overflow-y-scroll">
              <thead className="header-overlay">
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Head</th>
                  <th className="px-4 py-2 text-left">Staff Count</th>
                  <th className="px-4 py-2 text-left">Student Count</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-cyan-600">
                {departments.map((department) => (
                  <tr key={department.id} className="border-b">
                    <td className="px-4 py-2">{department.name}</td>
                    <td className="px-4 py-2">{department.head}</td>
                    <td className="px-4 py-2">{department.staffCount}</td>
                    <td className="px-4 py-2">{department.studentCount}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="mr-4 text-blue-500 hover:text-blue-700"
                        title={`edit ${department.name}`}
                      >
                        <FaEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDepartmentDetails(department)}
                        className="mr-2 text-green-500 hover:text-green-700"
                        title={`info about ${department.name}`}
                      >
                        <FaInfoCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Department Statistics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={departmentStats}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis dataKey="studentCount" />
              <Tooltip />
              <Legend />
              <Bar dataKey="staffCount" fill="#8884d8" name="Staff Count" />
              <Bar dataKey="studentCount" fill="#82ca9d" name="Student Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default DepartmentManagement;
