// pages/dashboard/reports/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaPrint,
  FaFilePdf,
  FaFileExcel,
  FaChartBar,
  FaCalendar,
  FaFilter,
  FaBook,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";
import {
  SelectField,
  MultiSelectDropdown,
} from "../../components/inputFieldSelectField";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("");
  const [reportData, setReportData] = useState(null);
  const [selectedClass, setSelectedClass] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [user_id, setUser_id] = useState(true);

  useEffect(() => {
    if (
      session?.user?.roles?.includes("admin") ||
      session?.user?.role === "admin"
    ) {
      setUser_id(session?.user?.id);
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }

    // console.log("session roles", session?.user?.roles[0]);
  }, [session]);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      // Replace with actual API calls to fetch data
      const dummyClasses = [
        { value: "class1", label: "Class 1" },
        { value: "class2", label: "Class 2" },
        { value: "class3", label: "Class 3" },
      ];
      const dummyStudents = [
        { value: "student1", label: "Student 1" },
        { value: "student2", label: "Student 2" },
        { value: "student3", label: "Student 3" },
      ];

      const dummySemesters = [
        { value: "semester1", label: "Semester 1" },
        { value: "semester2", label: "Semester 2" },
      ];
      setClasses(dummyClasses);
      setStudents(dummyStudents);
      setSemesters(dummySemesters);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setReportData(null); // Clear previous report data
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);
  };

  const handleStudentChange = (value) => {
    setSelectedStudent(value);
  };

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
  };

  const generateReport = () => {
    // Simulate generating report data based on selected options
    let generatedData;

    if (reportType === "academic") {
      generatedData = {
        type: "Academic Report",
        data: [
          { subject: "Math", grade: "A" },
          { subject: "English", grade: "B" },
          { subject: "Science", grade: "A+" },
          { subject: "History", grade: "B+" },
        ],
        remarks: `
          Overall Performance: Excellent
          {Student Name} has shown consistent improvement in all subjects.
          
          Mathematics: Outstanding performance. {Student Name} demonstrates a strong understanding of mathematical concepts and problem-solving skills.
          English: Very good performance. {Student Name} excels in reading comprehension and writing skills.
          Science: Excellent grasp of scientific principles. {Student Name} actively participates in class experiments and discussions.
          History: Good understanding of historical events and their significance. {Student Name} contributes insightful analyses during class discussions.

          {Student Name} is a dedicated student who consistently strives for excellence. Keep up the good work!
        `,
      };
    } else if (reportType === "attendance") {
      generatedData = {
        type: "Attendance Report",
        data: [
          { month: "January", attendance: "95%" },
          { month: "February", attendance: "98%" },
          { month: "March", attendance: "92%" },
          { month: "April", attendance: "96%" },
        ],
      };
    } else if (reportType === "financial") {
      generatedData = {
        type: "Financial Report",
        data: [
          { month: "January", feesPaid: "GHC 2500" },
          { month: "February", feesPaid: "GHC 1800" },
          { month: "March", feesPaid: "GHC 2200" },
          { month: "April", feesPaid: "GHC 2000" },
        ],
      };
    }

    setReportData(generatedData);
  };

  const printReport = () => {
    window.print();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page...!
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 text-cyan-700">
      <h1 className="text-3xl font-bold mb-6">School Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Report Type Selection */}
        <SelectField
          label="Report Type"
          name="report_type"
          value={reportType}
          onChange={handleReportTypeChange}
          options={[
            { value: "", label: "Select Report Type" },
            { value: "academic", label: "Academic Report" },
            { value: "attendance", label: "Attendance Report" },
            { value: "financial", label: "Financial Report" },
          ]}
          icon={<FaFileAlt className="text-cyan-700" />}
        />
        {/* Class Selection */}
        <MultiSelectDropdown
          label="Class"
          options={classes}
          selectedValues={selectedClass}
          onChange={handleClassChange}
          placeholder="Select Class"
        />
        {/* Student Selection */}
        <MultiSelectDropdown
          label="Student"
          options={students}
          selectedValues={selectedStudent}
          onChange={handleStudentChange}
          placeholder="Select Student"
        />

        {/* Semester Selection */}
        <MultiSelectDropdown
          label="Semester"
          options={semesters}
          selectedValues={selectedSemester}
          onChange={handleSemesterChange}
          placeholder="Select Semester"
        />
      </div>
      {/* Generate Report Button */}
      <button
        onClick={generateReport}
        className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-4 rounded flex items-center mb-6"
      >
        <FaChartBar className="mr-2" /> Generate Report
      </button>
      {/* Report Display Area */}
      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 printable-content">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-700">
              {reportData.type}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={printReport}
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <FaPrint className="mr-2" /> Print
              </button>
            </div>
          </div>
          {reportData.type === "Academic Report" && (
            <div className="mb-4">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border-b text-left">Subject</th>
                    <th className="p-3 border-b text-left">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b">{item.subject}</td>
                      <td className="p-3 border-b">{item.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4">
                <h3 className="font-bold">Remarks:</h3>
                <p
                  className="whitespace-pre-line"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "#333",
                  }}
                >
                  {reportData.remarks}
                </p>
              </div>
            </div>
          )}
          {reportData.type === "Attendance Report" && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendance" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {reportData.type === "Financial Report" && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="feesPaid" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
