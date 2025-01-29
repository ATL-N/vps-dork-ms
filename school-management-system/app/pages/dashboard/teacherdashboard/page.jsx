// app/pages/dashboard/teacherdashboard
"use client";

import React, { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaUsers,
  FaClipboardCheck,
  FaClock,
  FaBell,
  FaUserGraduate,
  FaFileAlt,
  FaBookOpen,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaBookOpenReader, FaFileCirclePlus } from "react-icons/fa6";

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
import Link from "next/link";
import Modal from "../../../components/modal/modal";
import StatCard from "../../../components/statcard";
import Teacherscheculepage from "../../staff/schedule/staffschedule";
import { fetchData, getTodayString } from "../../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";
import ClassMasterSheet from "../../grading/gradebook/classmastersheet";
import Addgrades from "../../grading/add/addgrade";
import Viewinvoice from "../../financial/viewClassInvoice/viewclassinvoice";
import ReportCardPage from "../../grading/reportcard/reportcard";
import CustomTable from "../../../components/listtableForm";

const TeacherDashboard = () => {
  const { data: session, status } = useSession();

  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [weeklyTeachingHours, setWeeklyTeachingHours] = useState(0);
  const [evaluationData, setEvaluationData] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [classesData, setClassesData] = useState([]);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher", "teaching staff"];
    const authorizedPermissions = ["view staff"];

    if (
      session?.user?.roles?.some((role) => authorizedRoles.includes(role)) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsLoading(true);
      fetchAllData(session.user?.id, session.user.activeSemester.semester_id);
      setIsAuthorised(true);
      setIsLoading(false);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  const handleTakeExamsMarks = () => {
    setModalContent(
      <Addgrades
        onClose={() => {
          setShowModal(false);
          // fetchClassData();
          // fetchTimetableData(classId);
          // fetchAttendanceSheet(classId, activeSemester);
        }}
        // classId={classId}
        onSubmit={() => {
          setShowModal(false);
          fetchAttendanceData();
        }}
      />
    );
    setShowModal(true);
  };

  const handleViewInvoice = async () => {
    try {
      const [semesterData, classData] = await Promise.all([
        fetchData("/api/semester/all", "semester"),
        fetchData("/api/classes/all", "staff"),
      ]);

      setModalContent(
        <div>
          <Viewinvoice
            classData={classData?.classes}
            semesterData={semesterData}
            onCancel={() => {
              setShowModal(false);
            }}
          />
        </div>
      );
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      setShowModal(true);
    }
  };

  const handleViewAllGradebook = () => {
    setModalContent(
      <div>
        <ClassMasterSheet
          onClose={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleViewSchoolReport = () => {
    setModalContent(
      <ReportCardPage
        onClose={() => setShowModal(false)}
        // onSave={handleSaveClassRemarks}
        // userRole={userRole}
      />
    );
    setShowModal(true);
  };

  const fetchAllData = async (teacher_id, semester_id) => {
    const [staffdata, events, classesdata, notifications, teachinghours] =
      await Promise.all([
        fetchData(`/api/staff/userstaffdetails/${teacher_id}`, "", false),
        fetchData(`/api/events/getallevents/${semester_id}`, "", false),
        fetchData(`/api/classes/all`, "", false),
        fetchData(`/api/notification/allnotifications`, "", false),
        fetchData(
          `/api/staff/getteachinghours?userId=${teacher_id}&semesterId=${semester_id}`,
          "",
          false
        ),
      ]);
    // console.log("staffData", staffdata?.evaluations);
    setStaffData(staffdata), setEvaluationData(staffdata?.evaluations);

    const filteredEvents = events?.events?.filter(
      (event) =>
        (event?.target_audience === "All" || event?.target_audience == "Staff") &&
        event?.date >= getTodayString()
    );

    setUpcomingEvents(filteredEvents);
    setClassesData(classesdata);
    setRecentAnnouncements(notifications);
    setWeeklyTeachingHours(teachinghours);
  };

  // let evaluationData;
  // let staffData = [];

  function extractEvaluationData(data) {
    console.log("extractEvaluationData", data);
    return data.map((item) => {
      return {
        // evaluation_id: item.evaluation_id,
        evaluation_date: item.evaluation_date,
        teaching_effectiveness: item.teaching_effectiveness,
        classroom_management: item.classroom_management,
        student_engagement: item.student_engagement,
        professionalism: item.professionalism,
        overall_rating: item.overall_rating,
        years_of_experience: item.years_of_experience,
        comments: item.comments,
      };
    });
  }

  const headerNames = [
    // "eval id",
    "Evaluation Date",
    "Teaching Effectiveness",
    "Class Management",
    "Student Engagement",
    "Professionalism",
    "Overall ratings",
    "Years of experience",
    "Comment",
  ];

  if (status === "loading" || isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">Staff Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaChalkboardTeacher />}
          title="No. of Classes"
          value={`${weeklyTeachingHours?.total_classes || 0}`}
        />
        <StatCard
          icon={<FaUsers />}
          title="Students"
          value={`${weeklyTeachingHours?.total_students || 0}`}
        />
        <StatCard
          icon={<FaClock />}
          title="No. of Periods"
          value={`${weeklyTeachingHours?.total_periods_per_week || 0}/week`}
        />

        <StatCard
          icon={<FaClock />}
          title="Teaching Hours"
          value={`${weeklyTeachingHours?.total_hours_per_week || 0}/week`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <button
              onClick={handleTakeExamsMarks}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaUserGraduate className="mx-auto mb-2 text-2xl" /> Enter Exams
              results
            </button>

            <button
              onClick={handleViewInvoice}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaFileAlt className="mx-auto mb-2 text-2xl" /> View Class Bills
            </button>

            <button
              onClick={handleViewAllGradebook}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaFileAlt className="mx-auto mb-2 text-2xl" /> School Masters
              sheets
            </button>

            <button
              onClick={handleViewSchoolReport}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaFileAlt className="mx-auto mb-2 text-2xl" /> School Report
              Cards
            </button>

            {/* <Link
              href={"/pages/studentremarks/details"}
              about="Click to open remarks page"
              className="p-4 bg-green-200 rounded-lg text-center hover:bg-green-300 transition duration-300"
            >
              <button
              // onClick={handleAddExpense}
              >
                <FaBookOpen className="mx-auto text-2xl" />
                Remarks
              </button>
            </Link> */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Class Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classesData?.classes || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_score" name={'Average Score'} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow overflow-auto hover:text-cyan-500 max-h-[60vh]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Recent Announcements
          </h2>
          <ul>
            {recentAnnouncements?.map((announcement, index) => (
              <li key={index} className="mb-4 pb-4 border-b last:border-b-0">
                <div className="flex items-center">
                  <FaBell className="text-cyan-500 mr-2" />
                  <span className="font-semibold">
                    {announcement?.notification_title}
                  </span>
                </div>
                <p className="ml-6 text-sm text-gray-600">
                  {new Date(announcement?.sent_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Upcoming Events
          </h2>
          <ul>
            {upcomingEvents.map((event, index) => (
              <li key={index} className="mb-2 pb-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-cyan-500 mr-2" />
                  <span className="font-semibold">{event?.date}</span>
                </div>
                <p className="ml-6 text-cyan-700">{event?.title}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <Teacherscheculepage showStaffDet={false} staffData={staffData} />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow ">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Staff Evaluation
          </h2>
          {evaluationData?.length > 0 ? (
            <div className="overflow-x-auto tableWrap ">
              <CustomTable
                data={extractEvaluationData(evaluationData)}
                headerNames={headerNames}
                height="20vh"
                displayActions={false}
                displaySearchBar={false}
              />
            </div>
          ) : (
            <div>
              <p>
                No past evaluation(s) available.{" "}
                <b>All evaluations is displayed here</b>
              </p>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            // fetchAnalytics(activeSem);
          }}
        >
          {modalContent}
        </Modal>
      )}
    </div>
  );
};

export default TeacherDashboard;
