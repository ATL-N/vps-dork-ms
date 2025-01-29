// pages/dashboard/reports/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaPlus,
  FaEye,
  FaDownload,
  FaChartBar,
} from "react-icons/fa";
import StatCard from "../statcard";
import Modal from "../modal/modal";
import GenerateReport from "./generatereport";
import ViewReport from "./viewreport";

const ReportsManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        title: "Academic Performance Q1 2024",
        type: "Academic",
        date: "2024-03-30",
      },
      {
        id: 2,
        title: "Attendance Report 2024",
        type: "Attendance",
        date: "2024-04-15",
      },
      {
        id: 3,
        title: "Financial Summary 2024",
        type: "Financial",
        date: "2024-05-01",
      },
      {
        id: 4,
        title: "Staff Evaluation 2024",
        type: "Staff",
        date: "2024-05-15",
      },
    ];
    setReports(data);
  };

  const handleGenerateReport = () => {
    setModalContent(
      <GenerateReport
        onClose={() => setShowModal(false)}
        onGenerate={fetchReports}
      />
    );
    setShowModal(true);
  };

  const handleViewReport = (report) => {
    setModalContent(
      <ViewReport report={report} onClose={() => setShowModal(false)} />
    );
    setShowModal(true);
  };

  const handleExportReport = (report) => {
    // Implement export functionality
    console.log("Exporting report:", report);
    // You would typically initiate a download here
  };

  return (
    <>
      <div className="pb-16">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Reports Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaFileAlt />}
            title="Total Reports"
            value={reports.length}
          />
          <StatCard
            icon={<FaChartBar />}
            title="Academic Reports"
            value={reports.filter((r) => r.type === "Academic").length}
          />
          <StatCard
            icon={<FaChartBar />}
            title="Financial Reports"
            value={reports.filter((r) => r.type === "Financial").length}
          />
          <StatCard
            icon={<FaChartBar />}
            title="Other Reports"
            value={
              reports.filter((r) => !["Academic", "Financial"].includes(r.type))
                .length
            }
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Reports Management
            </h2>
            <button
              onClick={handleGenerateReport}
              className="p-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 flex items-center"
            >
              <FaPlus className="mr-2" /> Generate New Report
            </button>
          </div>
          <div className="overflow-x-auto tableWrap height-45vh">
            <table className="w-full table-auto overflow-y-scroll text-cyan-600">
              <thead className="header-overlay">
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Date Generated</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b">
                    <td className="px-4 py-2">{report.title}</td>
                    <td className="px-4 py-2">{report.type}</td>
                    <td className="px-4 py-2">{report.date}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="mr-2 text-blue-500 hover:text-blue-700"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleExportReport(report)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default ReportsManagement;
