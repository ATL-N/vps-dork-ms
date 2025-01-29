// pages/dashboard/student.js
"use client";
import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaBookOpen,
  FaCalendarCheck,
  FaClock,
  FaBell,
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
import GradeDistributionChart from "../../../components/grade/gradedistributionchart";
import AttendanceTrendChart from "../../../components/attendancecomponent/attendancechart";
import { fetchData, getTodayString } from "../../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";
import TimetableViewer from "../../timetable/viewclassTimetable/viewtimtable";

const Studentdashboard = () => {
  const { data: session, status } = useSession();

  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [weeklyTeachingHours, setWeeklyTeachingHours] = useState(0);
  const [activesem, setActivesem] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [semesterData, setSemesterData] = useState([]);

  useEffect(() => {
    const authorizedRoles = [
      "admin",
      "head teacher",
      "teaching staff",
      "student",
    ];
    // console.log('running useeffect', session)
    if (
      session?.user?.roles?.some((role) => authorizedRoles.includes(role)) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setActivesem(session?.user?.activeSemester);

      // setIsLoading(true);
      fetchAllData(session.user?.id, session.user?.activeSemester.semester_id);
      setIsAuthorised(true);
      setIsLoading(false);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  const fetchAllData = async (userId, semester_id) => {
    console.log("running fetch all data");
    const [studentdata1, events, classesdata, notifications, semestersdata] =
      await Promise.all([
        fetchData(
          `/api/attendance/getstudentattendance/${userId}/${semester_id}`,
          "",
          false
        ),
        fetchData(`/api/events/getallevents/${semester_id}`, "", false),
        fetchData(`/api/classes/all`, "", false),
        fetchData(`/api/notification/allnotifications`, "", false),
        fetchData(`/api/semester/all`, "", false),

        // fetchData(
        //   `/api/staff/getteachinghours?userId=${userId}&semesterId=${semester_id}`,
        //   "",
        //   false
        // ),
      ]);

    // fetchTimetableData(studentdata?.studentInfo?.class_id, semester_id);

    // console.log("studentData", studentdata?.gradeData);
    setStudentData(studentdata1), 
    setGradeData(studentdata1?.gradeData || []);
    setAttendanceData(studentdata1?.attendanceData);
    setWeeklyTeachingHours(studentdata1?.scheduleData?.totalWeeklyHours || 0);
    setStudentClass(studentdata1?.studentInfo?.class_id);
    setSemesterData(semesterData);

    const filteredEvents = events?.events?.filter(
      (event) =>
        (event.target_audience === "All" ||
          event.target_audience == "Students") &&
        event.date >= getTodayString()
    );

    setUpcomingEvents(filteredEvents);
    setClassesData(classesdata?.classes);
    setRecentAnnouncements(notifications);
  };

  if (status === "loading" || isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page...!
      </div>
    );
  }

  return (
    <div className="pb-16">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Student Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaUserGraduate />}
          title="AVERAGE"
          value={studentData?.averagePerformance || 0}
        />
        <StatCard
          icon={<FaBookOpen />}
          title="No. of Subjects"
          value={gradeData?.length || 0}
        />
        <StatCard
          icon={<FaCalendarCheck />}
          title="Attendance Rate"
          value={attendanceData?.overallRate || 0}
        />
        <StatCard icon={<FaClock />} title="Study Hours" value="120" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {attendanceData?.monthlyData > 0 ? (
          <AttendanceTrendChart
            data={attendanceData?.monthlyData || []}
            xAxisKey={"month"}
            yAxisKey={"attendance"}
            title="Attendance"
          />
        ) : (
          <div className="bg-white p-4 rounded shadow">
            No Attendance Data found
          </div>
        )}

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Academic Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="grade" fill="#8884d8" label="Grade" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* <GradeDistributionChart
            data={gradeData}
            valueKey="grade"
            labelKey={"subject"}
          /> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Upcoming Events
          </h2>
          <ul>
            {upcomingEvents.map((event, index) => (
              <li key={index} className="mb-2 pb-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <FaCalendarCheck className="text-cyan-500 mr-2" />
                  <span className="font-semibold">{event.date}</span>
                </div>
                <p className="ml-6">{event.event}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow overflow-auto hover:text-cyan-500 max-h-[60vh]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Recent Announcements
          </h2>
          <ul>
            {recentAnnouncements.map((announcement, index) => (
              <li key={index} className="mb-4 pb-4 border-b last:border-b-0">
                <div className="flex items-center">
                  <FaBell className="text-cyan-500 mr-2" />
                  <span className="font-semibold">
                    {announcement.notification_title}
                  </span>
                </div>
                <p className="ml-6 text-sm text-gray-600">
                  {new Date(announcement.sent_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Class Timetable
          </h2>
          {studentClass && activesem && (
            <TimetableViewer
              classesData={classesData}
              semesterData={semesterData}
              classId={studentClass}
              semesterId={activesem?.semester_id}
              displayPrintBtn={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Studentdashboard;
