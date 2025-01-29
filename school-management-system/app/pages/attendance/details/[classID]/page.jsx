// pages/dashboard/attendance/index.js
"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUserCheck,
  FaEdit,
  FaChartBar,
  FaFileAlt,
  FaPlus,
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
import StatCard from "../../../../components/statcard";
import Modal from "../../../../components/modal/modal";
import CustomTable from "../../../../components/listtableForm";
import TakeAttendance from "../../takeattendance/takeattendace";
import AttendanceReport from "../../attendancereport/attendancereport";

const StudentAttendanceForClass = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceStats();
  }, []);

  const fetchAttendanceData = async (searchQuery1 = "") => {
    // Implement the fetch logic here
    // This is a placeholder for demonstration
    setAttendanceData([
      { id: 1, date: "2024-08-07", class: "Math 101", present: 25, absent: 5 },
      {
        id: 2,
        date: "2024-08-07",
        class: "English 202",
        present: 30,
        absent: 2,
      },
      // Add more mock data as needed
    ]);
    setIsLoading(false);
  };

  const fetchAttendanceStats = async () => {
    // Implement the fetch logic here
    // This is a placeholder for demonstration
    setAttendanceStats([
      { subject: "Math", attendanceRate: 95 },
      { subject: "English", attendanceRate: 98 },
      { subject: "Science", attendanceRate: 92 },
      // Add more mock data as needed
    ]);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchAttendanceData(e.target.value);
  };

  const handleTakeAttendance = () => {
    setModalContent(
      <TakeAttendance
        onClose={() => setShowModal(false)}
        onSubmit={() => {
          setShowModal(false);
          fetchAttendanceData();
        }}
      />
    );
    setShowModal(true);
  };

  const handleEditAttendance = (attendanceId) => {
    setModalContent(
      <EditAttendance
        attendanceId={attendanceId}
        onClose={() => setShowModal(false)}
        onSubmit={() => {
          setShowModal(false);
          fetchAttendanceData();
        }}
      />
    );
    setShowModal(true);
  };

  const handleAttendanceReport = () => {
    setModalContent(<AttendanceReport onClose={() => setShowModal(false)} />);
    setShowModal(true);
  };

  const headerNames = ["Date", "Class", "Present", "Absent"];

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Student Attendance for ...
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FaUserCheck />} title="Total Students" value="500" />
          <StatCard icon={<FaUserCheck />} title="Present Today" value="480" />
          <StatCard icon={<FaUserCheck />} title="Absent Today" value="20" />
          <StatCard icon={<FaChartBar />} title="Attendance Rate" value="96%" />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Attendance Management
            </h2>
            <div className="flex">
              <button
                onClick={handleTakeAttendance}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
              >
                <FaPlus className="mr-2" /> Take Attendance
              </button>
              <button
                onClick={handleAttendanceReport}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
              >
                <FaFileAlt className="mr-2" /> Attendance Report
              </button>
            </div>
          </div>
          <div className="overflow-x-auto tableWrap">
            <CustomTable
              data={attendanceData}
              headerNames={headerNames}
              maxTableHeight="40vh"
              height="20vh"
              handleEdit={handleEditAttendance}
              handleSearch={handleSearchInputChange}
              searchTerm={searchQuery}
              searchPlaceholder="Search by date or class"
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Attendance Analytics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendanceRate" fill="#8884d8" />
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

export default StudentAttendanceForClass;
