'use client'
// components/StudentProfile.js
import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaHeartbeat,
  FaCalendarCheck,
  FaBookOpen,
  FaBook,
} from "react-icons/fa";
import HealthRecordPage from "./healthcomponent/healthrecordpage";
import DisciplineRecordPage from "./disciplinecomponent/disciplineRecordPage";
// import StudentAttendanceReport from "../";
import StudentReportCardPage from "./academicscomponent/StudentReportCardPage";
import StudentTranscriptPage from "./academicscomponent/StudentTranscriptPage"

const healthData = {
  medicalConditions: ["Asthma"],
  allergies: ["Peanuts", "Dust"],
  medications: ["Albuterol inhaler"],
  incidents: [
    {
      date: "2023-04-10",
      description: "Asthma attack",
      actionTaken: "Used inhaler, parents notified",
    },
    {
      date: "2023-05-22",
      description: "Scraped knee during recess",
      actionTaken: "Cleaned and bandaged",
    },
    // ... more health incidents
  ],
};

const attendanceData = [
  { date: "2023-07-01", status: "Present", notes: "" },
  { date: "2023-07-02", status: "Absent", notes: "Sick leave" },
  // ... more attendance records
];

const disciplineData = [
  {
    date: "2023-05-15",
    incident: "Disruptive behavior in class",
    severity: "Minor",
    actionTaken: "Verbal warning",
  },
  {
    date: "2023-06-02",
    incident: "Skipping class",
    severity: "Moderate",
    actionTaken: "Detention",
  },
  // ... more discipline records
];

const CollapsibleSection = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        className="flex items-center justify-between w-full p-2 bg-gray-100 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          {icon}
          <span className="ml-2 font-semibold">{title}</span>
        </span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && (
        <div className="p-2 border-l border-r border-b rounded-b">
          {children}
        </div>
      )}
    </div>
  );
};

const StudentProfile = ({
  student,
  onClose,
  pageTitle = "Profile",
  reportCardData,
  transcriptData,
  handlePrint,
}) => {
  console.log("transcriptData", transcriptData);
  return (
    <div className="p-6 max-w-3xl mx-auto overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">{pageTitle}</h2>
      <div className="flex mb-6">
        <img
          src={student.profilePicture || "/default-profile-picture.jpg"}
          alt={`${student.name}'s profile`}
          className="w-32 h-32 rounded-full object-cover mr-6"
        />
        <div>
          <h3 className="text-xl font-semibold">{student.name}</h3>
          <p className="text-gray-600">Student ID: {student.id}</p>
        </div>
      </div>

      <h4 className="text-lg font-semibold mb-2">Basic Information</h4>
      <table className="w-full mb-6">
        <tbody>
          <tr>
            <td className="font-semibold pr-4 py-2">Grade:</td>
            <td>{student.grade}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Date of Birth:</td>
            <td>{student.dateOfBirth}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Gender:</td>
            <td>{student.gender}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Address:</td>
            <td>{student.address}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Phone:</td>
            <td>{student.phone}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Email:</td>
            <td>{student.email}</td>
          </tr>
        </tbody>
      </table>

      <CollapsibleSection
        title="Discipline Record"
        icon={<FaExclamationTriangle className="text-yellow-500" />}
      >
        {student.disciplineRecords.length > 0 ? (
          <DisciplineRecordPage
            disciplineData={student.disciplineRecords || disciplineData}
          />
        ) : (
          <p>No discipline records.</p>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Health Record"
        icon={<FaHeartbeat className="text-red-500" />}
      >
        <HealthRecordPage healthData={student.healthData || healthData} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Attendance Report"
        icon={<FaCalendarCheck className="text-green-500" />}
      >
        <p>
          <span className="font-semibold">Overall Attendance:</span>{" "}
          {student.attendance}
        </p>
        <p>
          <span className="font-semibold">Days Present:</span>{" "}
          {student.attendanceReport.daysPresent}
        </p>
        <p>
          <span className="font-semibold">Days Absent:</span>{" "}
          {student.attendanceReport.daysAbsent}
        </p>
        <p>
          <span className="font-semibold">Days Late:</span>{" "}
          {student.attendanceReport.daysLate}
        </p>
      </CollapsibleSection>

      <CollapsibleSection
        title="Academics Report card"
        icon={<FaBookOpen className="text-purple-500" />}
      >
        <StudentReportCardPage
          student={student}
          reportCardData={reportCardData}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Academics Transcript"
        icon={<FaBook className="text-purple-500" />}
      >
        <StudentTranscriptPage
          student={student}
          transcriptData={transcriptData}
        />
      </CollapsibleSection>

      <div className="mt-6 text-right">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;
