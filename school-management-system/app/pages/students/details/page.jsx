// pages/dashboard/students/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaUserPlus,
  FaEdit,
  FaInfoCircle,
  FaCalendarCheck,
  FaChartBar,
  FaClipboardList,
  FaStar,
  FaExclamationTriangle,
  FaHeartbeat,
  FaTrashAlt,
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
import Link from "next/link";
import StatCard from "../../../components/statcard";
import Modal from "../../../components/modal/modal";
import DeleteUser from "../../../components/deleteuser";
import Addnewstudent from "../add/addstudent";
import Studentprofilepage from "../studentprofile/studentprofile";
import CustomTable from "../../../components/listtableForm";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const headerNames = [
    "id",
    "Name",
    "Gender",
    "Date of birth",
    "Phone",
    "class id",
    "class name",
    "Subject",
  ];

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setModalContent("edit");
    setShowModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // setCurrentPage(1);
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setModalContent("profile");
    setShowModal(true);
  };

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student);
    setModalContent("delete");
    setShowModal(true);
  };

  useEffect(() => {
    fetchStudents();
    fetchStudentStats();
  }, []);

  const fetchStudents = async () => {
    // Replace with actual API call
    try {
      const response = await fetch("/api/students/studentdetails");
      if (!response.ok) {
        throw new Error("Failed to fetch teachers");
      }
      const data = await response.json();
      setStudents(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const fetchStudentStats = async () => {
    try {
      const response = await fetch("/api/students/studentstats");
      if (!response.ok) {
        throw new Error("Failed to fetch student stats");
      }
      const data = await response.json();

      // Assuming the API returns an array of objects with class_name and count
      const formattedData = data.map((item) => ({
        grade: item.class_name,
        count: item.count,
      }));

      setStudentStats(formattedData);
    } catch (err) {
      setError(err.message);
    }
  };

  const onClose = () => {
    setShowModal(false);
  };

  const handleAddStudent = () => {
    setShowModal(true);
    setModalContent("add");
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Student Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaUserGraduate />}
          title="Total Students"
          value={students.length}
          isButton={true}
        />
        <StatCard
          icon={<FaCalendarCheck />}
          title="Avg. Attendance"
          value={`${(
            students.reduce(
              (acc, student) => acc + parseFloat(student.attendance),
              0
            ) / students.length
          ).toFixed(1)}%`}
        />
        <StatCard
          icon={<FaStar />}
          title="Avg. GPA"
          value={(
            students.reduce((acc, student) => acc + student.gpa, 0) /
            students.length
          ).toFixed(2)}
        />
        <StatCard
          icon={<FaExclamationTriangle />}
          title="Discipline Issues"
          value={students.reduce(
            (acc, student) => acc + student.disciplineIssues,
            0
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link
          href="/pages/grading/reportcard"
          className="bg-cyan-600 p-4 rounded shadow text-white hover:text-cyan-900 hover:shadow-md transition-shadow "
        >
          <h2 className="text-xl font-semibold mb-2  flex items-center ">
            <FaClipboardList className="mr-2" /> Grade Reports
          </h2>
          <p>Access student grade reports.</p>
        </Link>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">Student List</h2>
          <button
            onClick={handleAddStudent}
            className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
          >
            <FaUserPlus className="mr-2" /> Add New Student
          </button>
        </div>
        <div className="overflow-x-auto tableWrap height-45vh">
          <CustomTable
            data={students}
            headerNames={headerNames}
            maxTableHeight="40vh"
            height="20vh"
            handleDelete={handleDeleteStudent}
            handleEdit={handleEditStudent}
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            searchPlaceholder="search student with name or class"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Student Distribution by Class
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={studentStats}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {modalContent === "add" && (
            <Addnewstudent
              onClose={() => setShowModal(false)}
              onAdd={fetchStudents}
            />
          )}
          {modalContent === "edit" && (
            <Addnewstudent
              student={selectedStudent}
              onClose={() => setShowModal(false)}
              onEdit={fetchStudents}
            />
          )}
          {modalContent === "profile" && (
            <Studentprofilepage student={selectedStudent} onClose={onClose} />
          )}
          {modalContent === "delete" && (
            <DeleteUser
              student={selectedStudent}
              onClose={() => setShowModal(false)}
              onDelete={fetchStudents}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default StudentManagement;
