// pages/dashboard/student-remarks/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaComments,
  FaPlus,
  FaEdit,
  FaHistory,
  FaChartBar,
  FaSearch,
  FaFilter,
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
import StatCard from "../../../components/statcard";
import Modal from "../../../components/modal/modal";
import AddEditRemark from "../../../components/studentremarkscomponent/addeditremarks";
import ViewRemarkHistory from "../../../components/studentremarkscomponent/remarkshistory";
import SemesterSelector from "../../../components/studentremarkscomponent/semesterselector";
import ClassRemarksTable from "../../../components/studentremarkscomponent/classremarkstable";
// import Pagination from "../components/pagination";

const StudentRemarks = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [remarkStats, setRemarkStats] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [userRole, setUserRole] = useState("teacher");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    fetchRemarks();
    fetchRemarkStats();
  }, [selectedSemester, currentPage, searchTerm, filterClass]);

  const fetchRemarks = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        studentName: "John Doe",
        class: "10A",
        teacherRemark:
          "John has shown excellent progress across all subjects. His dedication and hard work are commendable.",
        headteacherRemark:
          "Outstanding performance. Keep up the good work, John!",
        date: "2024-07-15",
        grades: {
          Mathematics: "A",
          Science: "A-",
          English: "B+",
          History: "A",
        },
      },
      // ... more remarks
    ];
    setRemarks(data);
  };

  const fetchRemarkStats = async () => {
    // Replace with actual API call
    const data = [
      { class: "10A", positiveRemarks: 25, negativeRemarks: 5 },
      { class: "10B", positiveRemarks: 20, negativeRemarks: 8 },
      { class: "11A", positiveRemarks: 22, negativeRemarks: 3 },
      { class: "11B", positiveRemarks: 18, negativeRemarks: 7 },
    ];
    setRemarkStats(data);
  };

  const handleAddRemark = () => {
    setModalContent(
      <AddEditRemark
        onClose={() => setShowModal(false)}
        onSave={fetchRemarks}
        userRole={userRole}
      />
    );
    setShowModal(true);
  };

  const handleAddEditClassRemarks = (classId) => {
    setModalContent(
      <ClassRemarksTable
        classId={classId}
        onClose={() => setShowModal(false)}
        onSave={handleSaveClassRemarks}
        userRole={userRole}
      />
    );
    setShowModal(true);
  };

  const handleSaveClassRemarks = (classData) => {
    // Here you would typically send the data to your backend
    console.log("Saving class remarks:", classData);
    fetchRemarks(); // Refresh the remarks list
  };

  const handleEditRemark = (remark) => {
    setModalContent(
      <AddEditRemark
        remark={remark}
        onClose={() => setShowModal(false)}
        onSave={fetchRemarks}
        userRole={userRole}
      />
    );
    setShowModal(true);
  };

  const handleViewHistory = (studentName) => {
    setModalContent(
      <ViewRemarkHistory
        studentName={studentName}
        onClose={() => setShowModal(false)}
      />
    );
    setShowModal(true);
  };

  const filteredRemarks = remarks.filter(
    (remark) =>
      remark.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterClass === "" || remark.class === filterClass)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRemarks = filteredRemarks.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Student Remarks
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaComments />}
            title="Total Remarks"
            value={remarks.length}
          />
          <StatCard
            icon={<FaChartBar />}
            title="Positive Remarks"
            value={remarkStats.reduce(
              (acc, stat) => acc + stat.positiveRemarks,
              0
            )}
          />
          <StatCard
            icon={<FaChartBar />}
            title="Negative Remarks"
            value={remarkStats.reduce(
              (acc, stat) => acc + stat.negativeRemarks,
              0
            )}
          />
          <StatCard
            icon={<FaHistory />}
            title="Avg. Remarks per Class"
            value={(remarks.length / remarkStats.length).toFixed(1)}
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700 mb-2 md:mb-0">
              Remark List
            </h2>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <SemesterSelector
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
              />
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded py-1 px-2 mr-2"
                />
                <FaSearch className="text-cyan-700" />
              </div>
              <div className="flex items-center">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="border rounded py-1 px-2 mr-2"
                >
                  <option value="">All Classes</option>
                  {remarkStats.map((stat) => (
                    <option key={stat.class} value={stat.class}>
                      {stat.class}
                    </option>
                  ))}
                </select>
                <FaFilter className="text-cyan-700" />
              </div>
              <button
                onClick={handleAddEditClassRemarks}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Remark
              </button>
            </div>
          </div>
          <div className="overflow-x-auto tableWrap height-45vh">
            <table className="w-full table-auto overflow-y-scroll">
              <thead className="header-overlay">
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Student Name</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Teacher Remark</th>
                  <th className="px-4 py-2 text-left">Headteacher Remark</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-cyan-600">
                {currentRemarks.map((remark) => (
                  <tr key={remark.id} className="border-b">
                    <td className="px-4 py-2">{remark.studentName}</td>
                    <td className="px-4 py-2">{remark.class}</td>
                    <td className="px-4 py-2">{remark.teacherRemark}</td>
                    <td className="px-4 py-2">{remark.headteacherRemark}</td>
                    <td className="px-4 py-2">{remark.date}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditRemark(remark)}
                        className="mr-4 text-blue-500 hover:text-blue-700"
                        title={`Edit remark for ${remark.studentName}`}
                      >
                        <FaEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleViewHistory(remark.studentName)}
                        className="text-green-500 hover:text-green-700"
                        title={`View history for ${remark.studentName}`}
                      >
                        <FaHistory size={20} />
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
            Remark Statistics by Class
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={remarkStats}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="positiveRemarks"
                fill="#82ca9d"
                name="Positive Remarks"
              />
              <Bar
                dataKey="negativeRemarks"
                fill="#8884d8"
                name="Negative Remarks"
              />
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

export default StudentRemarks;
