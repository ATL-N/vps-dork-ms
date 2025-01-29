// pages/class/details.js
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  FaUsers,
  FaCalendarAlt,
  FaBook,
  FaChartLine,
  FaBell,
  FaUserPlus,
  FaMoneyBillWave,
  FaFileAlt,
  FaClipboardList,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "../../../../components/statcard";
import Modal from "../../../../components/modal/modal";
import ClassDetailsPage1 from "../classdetails";
import TakeAttendance from "../../../attendance/takeattendance/takeattendace";
import { fetchData } from "../../../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../../components/generalLoadingpage";
import Addgrades from "../../../grading/add/addgrade";
import AttendanceSheet from "../../../attendance/attendancesheet/page";
import TimetableViewer from "../../../timetable/viewclassTimetable/viewtimtable";

const ClassDetailsPage = ({ params }) => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [periods, setPeriods] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [classData, setClassData] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [overallData, setOverallData] = useState();
  const [activesem, setActivesem] = useState("");

  const classId = params.id;
  let activeSemester = session?.user?.activeSemester?.semester_id;

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      setActivesem(session?.user?.activeSemester);
      fetchClassData(session?.user?.activeSemester?.semester_id);
      fetchTimetableData(classId, session?.user?.activeSemester?.semester_id);
      fetchAttendanceSheet(classId, session?.user?.activeSemester?.semester_id);
    }
  }, [status, session]);

  const fetchClassData = async (semester_id) => {
    const activeSemester = session.user.activeSemester.semester_id;

    try {
      const [attendanceResponse, classdata, classesdata, semestersdata] =
        await Promise.all([
          fetchData(
            `/api/attendance/getattendance/${classId}/${semester_id}`,
            "",
            false
          ),
          fetchData(`/api/classes/getclassbyId/${classId}`, "", false),
          fetchData(`/api/classes/all`, "", false),
          fetchData(`/api/semester/all`, "", false),
        ]);

      const staffdata = await fetchData(
        `/api/staff/staffdetails/${classdata?.staff_id}`,
        "",
        false
      );
      setClassData(classdata);
      setStaffData(staffdata);
      setClassesData(classesdata?.classes);
      setSemesterData(semestersdata);
      setOverallData(attendanceResponse);
      setPerformanceData(attendanceResponse?.performanceData);
      setAttendanceData(attendanceResponse?.attendanceData || []);
    } catch (error) {
      console.error("Error fetching class data:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const fetchAttendanceSheet = async (class_id, semester_id) => {
    if (class_id && semester_id) {
      //  setLoading(true);
      try {
        const response = await fetchData(
          `/api/attendance/getattendancesheet/${class_id}/${semester_id}`,
          "",
          false
        );
        setAttendanceSheet(response?.attendanceData);
      } catch (err) {
        console.log(err.message);
      } finally {
        //  setLoading(false);
      }
    }
  };

  const fetchTimetableData = async (
    classId,
    semester_id = activesem.semester_id
  ) => {
    const url = `/api/timetable/getclasstimetable/${classId}/${semester_id}`;
    const data = await fetchData(url, "", false);

    if (data) {
      setTimetable(data.timetable);
      setPeriods(data.periods);
      setDaysOfWeek(data.daysOfWeek);
    } else {
      setError("Failed to load timetable. Please try again.");
    }
  };

  const handleTakeAttendance = () => {
    setModalContent(
      <TakeAttendance
        onClose={() => {
          setShowModal(false);
          fetchClassData(activesem?.semester_id);
          fetchTimetableData(classId, activesem);
          fetchAttendanceSheet(classId, activesem);
        }}
        class_id={classId}
        onSubmit={() => {
          setShowModal(false);
          fetchAttendanceData();
        }}
      />
    );
    setShowModal(true);
  };

  const handleTakeExamsMarks = () => {
    setModalContent(
      <Addgrades
        onClose={() => {
          setShowModal(false);
          fetchClassData(activesem?.semester_id);
          fetchTimetableData(classId, activesem);
          fetchAttendanceSheet(classId, activesem);
        }}
        classId={classId}
        onSubmit={() => {
          setShowModal(false);
          fetchAttendanceData();
        }}
      />
    );
    setShowModal(true);
  };

  const fetchAttendanceData = async () => {
    if (session) {
      activeSemester = session?.user?.activeSemester?.semester_id;
      const data = fetchData(
        `/api/attendance/getattendance/${classId}/${parseInt(activeSemester)}`,
        "",
        false
      );
      setAttendanceData(data?.attendanceData);
    }
  };

  if (status === "loading") {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <>
      <div className="pb-16 text-cyan-700">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700 ">
          Class Details - {overallData?.className}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaUsers />}
            title="Total Students"
            value={overallData?.totalStudents || 0}
          />
          <StatCard
            icon={<FaCalendarAlt />}
            title="Term's Attendance(%)"
            value={overallData?.attendancePercentage || 0}
          />
          <StatCard
            icon={<FaBook />}
            title="Subjects"
            value={overallData?.totalSubjects || 0}
          />
          <StatCard
            icon={<FaChartLine />}
            title="Average Performance(%)"
            value={overallData?.averagePerformance?.toFixed(2) || 0}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* <Link
            href={`/pages/attendance/details/${classId}`}
            className="bg-cyan-600 p-4 rounded shadow text-white hover:text-cyan-900 hover:shadow-md transition-shadow "
          >
            <h2 className="text-xl font-semibold mb-2  flex items-center ">
              <FaClipboardList className="mr-2" /> Full Attendance Records
            </h2>
            <p>Access class attendance reports.</p>
          </Link> */}

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleTakeAttendance}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaUserPlus className="mx-auto mb-2 text-2xl" /> Take Class
                Attendance
              </button>

              <button
                onClick={handleTakeExamsMarks}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaUserPlus className="mx-auto mb-2 text-2xl" /> Take Class
                Scores
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 my-6">
          {/* {classData.length > 0 ?  */}
          <div className="bg-white p-4 rounded shadow">
            <ClassDetailsPage1
              showBtns={false}
              classData={classData}
              staffData={staffData}
            />
          </div>
          {/* : <LoadingPage /> } */}
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Recent Announcements
            </h2>
            <ul>
              <li className="mb-2 pb-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <FaBell className="text-cyan-500 mr-2" />
                  <span className="font-semibold">
                    Science project due next week
                  </span>
                </div>
                <p className="ml-6 text-sm text-gray-600">2 days ago</p>
              </li>
              <li className="mb-2 pb-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <FaBell className="text-cyan-500 mr-2" />
                  <span className="font-semibold">
                    Parent-teacher meeting scheduled
                  </span>
                </div>
                <p className="ml-6 text-sm text-gray-600">1 week ago</p>
              </li>
            </ul>
          </div>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Today's Attendance
            </h2>
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {attendanceData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex">No Attendance taken today</div>
            )}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Class Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageScore" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Class Timetable
            </h2>
            {classId && activesem && (
              <TimetableViewer
                classesData={classesData}
                semesterData={semesterData}
                classId={classId}
                semesterId={activesem?.semester_id}
                displayPrintBtn={false}
              />
            )}
          </div>

          {attendanceSheet.length > 0 && (
            <AttendanceSheet attendancedata={attendanceSheet} />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 my-6 gap-6"></div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default ClassDetailsPage;
