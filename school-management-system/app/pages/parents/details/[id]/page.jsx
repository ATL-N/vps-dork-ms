"use client";

import React, { useState, useEffect } from "react";
import {
  FaChild,
  FaGraduationCap,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBell,
  FaInfoCircle,
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
  LineChart,
  Line,
} from "recharts";
import StatCard from "../../../../components/statcard";
import CustomTable from "../../../../components/listtableForm";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../../config/configFile";
import Modal from "../../../../components/modal/modal";
import Studentprofilepage from "./../../../students/studentprofile/studentprofile";
import Addnewstudent from "./../../../students/add/addstudent";

// Utility function to generate colors
const generateColors = (count) => {
  const baseColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#a4de6c",
    "#d0ed57",
    "#83a6ed",
    "#8dd1e1",
    "#82ca9d",
    "#a4de6c",
    "#d0ed57",
    "#ffc658",
  ];

  return Array(count)
    .fill()
    .map((_, i) => baseColors[i % baseColors.length]);
};

const ParentDashboard = ({ params }) => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activesem, setActivesem] = useState("");
  const [childrenPerformance, setChildrenPerformance] = useState("");
  const [formattedPerformanceData, setFormattedPerformanceData] = useState([]);
  const [performanceSubjects, setPerformanceSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [formattedAttendanceData, setFormattedAttendanceData] = useState([]);
  const [studentNames, setStudentNames] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [overallAverage, setOverallAverage] = useState(0);
  const [overallAttendanceRate, setOverallAttendanceRate] = useState(0);
  const [totalFeesOwed, setTotalFeesOwed] = useState(0);

  const parent_id = params.id;

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      setActivesem(session?.user?.activeSemester);
      fetchParentData(parent_id);
    }
  }, [status, session]);

  useEffect(() => {
    if (childrenPerformance && childrenPerformance.length > 0) {
      // Extract unique subjects from all children
      const subjects = Object.keys(childrenPerformance[0].subjects);
      setPerformanceSubjects(subjects);

      // Format data for the chart
      const formattedData = childrenPerformance.map((child) => ({
        name: child.name,
        ...child.subjects,
        average: child.average,
      }));

      setFormattedPerformanceData(formattedData);
    }
  }, [childrenPerformance]);

  useEffect(() => {
    if (attendanceData && attendanceData.length > 0) {
      // Extract all unique student names from attendance data
      const allStudentNames = new Set();
      attendanceData.forEach((monthData) => {
        Object.keys(monthData.attendance).forEach((name) => {
          allStudentNames.add(name);
        });
      });
      setStudentNames(Array.from(allStudentNames));

      // Format attendance data
      const formattedData = attendanceData.map((monthData) => ({
        month: monthData.month,
        ...monthData.attendance,
      }));

      setFormattedAttendanceData(formattedData);
    }
  }, [attendanceData]);

  const fetchParentData = async (parentId = parent_id) => {
    const url = `/api/parents/getparentsdetailswithparentid/${parentId}`;
    const data = await fetchData(url, "", false);

    if (data) {
      setStudents(data?.students);
      setChildrenPerformance(data?.childrenPerformance);
      setAttendanceData(data?.attendanceData);
      setUpcomingEvents(data?.upcomingEvents);
      setOverallAverage(data?.overallAverage);
      setOverallAttendanceRate(data?.overallAttendanceRate);
      setTotalFeesOwed(data?.totalFeesOwed);
    } else {
      setError("Failed to load timetable. Please try again.");
    }
  };

  const handleViewextendeddetails = async (student_id) => {
    try {
      const [studentdata] = await Promise.all([
        fetchData(
          `/api/students/extendedstudentdetails/${student_id}`,
          "",
          true
        ),
      ]);
      setModalContent(
        <div>
          <Studentprofilepage
            studentData={studentdata}
            onCancel={() => {
              setShowModal(false);
            }}
          />
        </div>
      );
    } catch (error) {
      console.log(error);
    } finally {
      setShowModal(true);
    }
  };

   const handleEditStudent = async (student_id) => {
     try {
       const [parentsData, classesData, studentsData] = await Promise.all([
         fetchData("/api/parents/getallparents", "", false),
         fetchData("/api/classes/all", "", false),
         fetchData(`/api/students/${student_id}`, "", true),
       ]);
       setModalContent(
         <div>
           <Addnewstudent
             classesData={classesData?.classes}
             parentsData={parentsData}
             id={student_id}
             studentsData={studentsData}
             details={true}
             onCancel={() => {
               setShowModal(false);
             }}
           />
         </div>
       );
     } catch (error) {
       console.log(error);
     } finally {
       setShowModal(true);
     }
   };

  const CustomPerformanceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          {payload[0]?.payload?.average && (
            <p className="mt-2 font-semibold text-gray-600">
              Average: {payload[0].payload.average}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomAttendanceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-semibold">Month: {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Parent Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaChild />}
          title="Children"
          value={students?.length || 0}
        />
        <StatCard
          icon={<FaGraduationCap />}
          title="Academic Average"
          value={overallAverage}
        />
        <StatCard
          icon={<FaCalendarAlt />}
          title="Attendance Rate(%)"
          value={overallAttendanceRate}
        />
        <StatCard
          icon={<FaMoneyBillWave />}
          title="Fees Due(GHC)"
          value={totalFeesOwed}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow mb-16 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            My Children
          </h2>
          <CustomTable
            data={students}
            headerNames={["ID", "Name", "Class", "Fees Owed(GHC)"]}
            displaySearchBar={false}
            displayDetailsBtn={true}
            displayDelBtn={false}
            displayEditBtn={false}
            displayEvaluationBtn={true}
            editIcon={<FaInfoCircle />}
            detailsTitle="View extended details for "
            evalTitle="View details for "
            handleDetails={handleViewextendeddetails}
            handleEvaluation={handleEditStudent}
          />{" "}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Children's Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomPerformanceTooltip />} />
              <Legend />
              {performanceSubjects.map((subject, index) => (
                <Bar
                  key={subject}
                  dataKey={subject}
                  name={subject}
                  fill={generateColors(performanceSubjects.length)[index]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Attendance Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomAttendanceTooltip />} />
              <Legend />
              {studentNames.map((studentName, index) => (
                <Line
                  key={studentName}
                  type="monotone"
                  dataKey={studentName}
                  name={studentName}
                  stroke={generateColors(studentNames.length)[index]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Upcoming Events
          </h2>
          {upcomingEvents?.length > 0 ? (
            <ul>
              {upcomingEvents.map((event, index) => (
                <li key={index} className=" pb-2 border-b last:border-b-0">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-cyan-500 mr-2" />
                    <span className="font-semibold">{event.date}</span>
                  </div>
                  <p className="ml-6 text-cyan-700">{event.event}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              There are no upcoming Events yet. All upcoming events would be
              displayed here
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default ParentDashboard;
