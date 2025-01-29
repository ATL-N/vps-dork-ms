"use client";
import React, { useState, useEffect } from "react";
import { FaSearch, FaUserCheck, FaChartBar } from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingPage from "../../../components/generalLoadingpage";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";
import StatCard from "../../../components/statcard";

const AttendanceAnalytics = ({ attendanceAnalysys }) => {
  const { data: session, status } = useSession();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analytics, setAnalytics] = useState(attendanceAnalysys);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
const [isAuthorised, setIsAuthorised] = useState(true);
const [activeSemester, setActiveSemester] = useState();

useEffect(() => {
  const authorizedRoles = ["admin"];
  const authorizedPermissions = ["view attendance analytics"];

  if (
    session?.user?.permissions?.some((permission) =>
      authorizedPermissions.includes(permission)
    ) ||
    authorizedRoles.includes(session?.user?.role)
  ) {
    setIsAuthorised(true);
  } else {
    setIsAuthorised(false);
  }

  if (
    status === "authenticated" &&
    session?.user?.activeSemester?.semester_id
  ) {
    setActiveSemester(session?.user?.activeSemester?.semester_id);
    // setUserId(session?.user?.id);
  }
}, [session, status]);

  
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      fetchClassesnSemesters();
      // fetchTimetableData(classId);
    }
  }, [status, session]);

  const fetchClassesnSemesters = async () => {
    setIsLoading(true);
    try {
      const [semesterdata, classdata] = await Promise.all([
        fetchData(`/api/semester/all`, "", false),
        fetchData(`/api/classes/all`, "", false),
      ]);
      setClasses(classdata?.classes);
      setSemesters(semesterdata);
    } catch (err) {
      // setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (selectedClass && selectedSemester) {
      setLoading(true);
      try {
        const response = await fetchData(
          `/api/attendance/getattendanceanalytics/${selectedClass}/${selectedSemester}`,
          "",
          false
        );
        console.log(response);
        setAnalytics(response);
      } catch (error) {
        console.error("Failed to fetch attendance analytics:", error);
      }
      setLoading(false);
    }
  };

  const statusDistributionData = analytics
    ? [
        { name: "Present", value: analytics.presentCount },
        { name: "Absent", value: analytics.absentCount },
        { name: "Late", value: analytics.lateCount },
      ]
    : [];

  if (isLoading)
    return (
      <div>
        <LoadingPage />
      </div>
    );

    if (!isAuthorised) {
      return (
        <div className="flex items-center text-cyan-700">
          You are not authorised "view attendance analytics" to be on this
          page...!
        </div>
      );
    }

  return (
    <div className="space-y-6 text-cyan-800 pb-16">
      <h2 className="text-2xl font-bold text-cyan-700">Attendance Analytics</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-2 font-semibold">Select Class</label>
            <select
              className="w-full border-2 border-cyan-300 rounded-md p-3 bg-white"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Select a class</option>
              {classes?.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Semester/Term</label>
            <select
              className="w-full border-2 border-cyan-300 rounded-md p-3 bg-white"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              required
            >
              <option value="">Select a semester</option>
              {semesters?.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {`${sem.semester_name} ${sem.start_date}`}
                </option>
              ))}
            </select>
          </div>
          {selectedClass && selectedSemester && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
              >
                <FaSearch className="mr-2" />
                Generate Analysis
              </button>
            </div>
          )}
        </div>
        {loading ? (
          <p>Generating analytics...</p>
        ) : analytics?.averageAttendanceRate ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Overall Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  icon={<FaChartBar />}
                  title="Average Attendance Rate"
                  value={`${analytics?.averageAttendanceRate}%`}
                />

                <StatCard
                  icon={<FaUserCheck />}
                  title="Total Classes"
                  value={analytics?.totalClasses}
                />
                <StatCard
                  icon={<FaUserCheck />}
                  title="Total Students"
                  value={analytics?.totalStudents}
                />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Daily Attendance Rate
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.dailyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="attendanceRate"
                      stroke="#8884d8"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Attendance Status Distribution
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={statusDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <p>No analytics generated yet. Please select a class and semester.</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
