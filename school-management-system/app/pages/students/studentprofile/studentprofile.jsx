"use client";
import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaHeartbeat,
  FaCalendarCheck,
  FaBookOpen,
  FaBook,
} from "react-icons/fa";
import HealthRecordPage from "../../../components/healthcomponent/healthrecordpage";
import DisciplineRecordPage from "../../../components/disciplinecomponent/disciplineRecordPage";
import StudentReportCardPage from "../../../components/academicscomponent/StudentReportCardPage";
import StudentTranscriptPage from "../../../components/academicscomponent/StudentTranscriptPage";
import StudentAttendanceReport from "../studentattendancereport/studentattendancereport";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";


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
  studentData,
  onCancel,
  pageTitle = "Student Profile",
  // healthData = dummyHealthData,
  handlePrint,
  displayBtns = true,
}) => {
  const { data: session, status } = useSession();

  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher", "student", "Student"];
    const authorizedPermissions = ["view student profile"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      console.log("student profile authorization");
      setIsAuthorised(true);
    } else {
      console.log("student profile authorization222");

      setIsAuthorised(false);
    }
  }, [session, status]);

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page
      </div>
    );
  }

  if (isLoading) {
    return <Loadingpage />;
  }
  // console.log("transcriptData", studentData);
  return (
    <div className="p-6 max-w-3xl mx-auto overflow-auto text-cyan-600 bg-white">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">{pageTitle}</h2>
      <div className="flex mb-6 bg-white">
        <img
          src={studentData?.student?.photo || "/default-profile-picture.jpg"}
          alt={`${studentData?.student?.name}'s profile`}
          className="w-32 h-32 rounded-full object-cover mr-6"
        />
        <div>
          <h3 className="text-xl font-semibold">{`${studentData?.student?.first_name} ${studentData?.student?.last_name} ${studentData?.student?.other_names}`}</h3>
          <p className="text-gray-600">
            Student ID: {studentData?.student?.id}
          </p>
        </div>
      </div>

      <h4 className="text-lg font-semibold mb-2">Basic Information</h4>
      <table className="w-full mb-6 ">
        <tbody className="grid">
          <tr>
            <td className="font-semibold pr-4 py-2">Grade:</td>
            <td>{studentData?.student?.class_name}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Date of Birth:</td>
            <td>{studentData?.student?.date_of_birth}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Gender:</td>
            <td>{studentData?.student?.gender}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Address:</td>
            <td>{studentData?.student?.residential_address}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Phone:</td>
            <td>{studentData?.student?.phone}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-4 py-2">Email:</td>
            <td>{studentData?.student?.email}</td>
          </tr>
        </tbody>
      </table>

      <CollapsibleSection
        title="Health Record"
        icon={<FaHeartbeat className="text-red-500" />}
      >
        <HealthRecordPage healthData={studentData?.healthRecord} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Attendance Report"
        icon={<FaCalendarCheck className="text-green-500" />}
      >
        <StudentAttendanceReport
          attendanceData={studentData?.attendanceData}
          showdetails={true}
          student={studentData?.student}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Academics Report card"
        icon={<FaBookOpen className="text-purple-500" />}
      >
        <StudentReportCardPage
          student={studentData?.student}
          reportCardData={studentData?.academicReport}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Academics Transcript"
        icon={<FaBook className="text-purple-500" />}
      >
        <StudentTranscriptPage
          student={studentData?.student}
          transcriptData={studentData?.transcript}
        />
      </CollapsibleSection>
      {displayBtns && (
        <div className="mt-6 text-right">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded mr-6 hover:bg-gray-700"
          >
            Close
          </button>
          {/* <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            Print
          </button> */}
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
