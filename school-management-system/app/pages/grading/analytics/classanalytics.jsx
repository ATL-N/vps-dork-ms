"use client";
import React,{useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import {
  FaChartBar,
  FaUserGraduate,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
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
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";
import CustomTable from "../../../components/listtableForm";


const ClassGradeAnalyticsPage = ({ class_id=3, onClose }) => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSem, setActiveSem] = useState(null);
  const [isDeleteAuthorised, setIsDeleteAuthorised] = useState(false);
const [isAuthorised, setIsAuthorised] = useState(true);
const [activeSemester, setActiveSemester] = useState();

useEffect(() => {
  if (
    status === "authenticated" &&
    session?.user?.activeSemester?.semester_id
  ) {
    const activeSemester = session.user.activeSemester.semester_id;
    setActiveSem(activeSemester);
    fetchAnalytics(class_id,activeSemester);
  } else if (status === "unauthenticated") {
    setError("You must be logged in to view this page.");
    setIsLoading(false);
  }
}, [status, session]);

useEffect(() => {
  const authorizedRoles = ["admin"];
  const authorizedPermissions = ["view class grade analytics"];

  if (
    session?.user?.permissions?.some((permission) =>
      authorizedPermissions.includes(permission)
    ) ||
    authorizedRoles.includes(session?.user?.role)
  ) {
    setIsDeleteAuthorised(true);
  } else {
    setIsDeleteAuthorised(false);
  }
}, [session]);

const breakdownHeaderNames = ["Grade", "Number of Students", "Percentage(%)"];
 const performanceHeaderNames = [
   "Subject",
   "Class Average(%)",
   "Top Score(%)",
   "Lowest Score(%)",
 ];

const fetchAnalytics = async (classId,semester_id=activeSem) => {
  // setIsLoading(true);
  setError(null);
  try {
    const data = await fetchData(
      `/api/grading/analyticsforclassnsemester/${classId}/${semester_id}`,
      "",
      false
    );
    // console.log("analytics", data);
    if (data && Object.keys(data).length > 0) {
      // console.log("analytics222", data);
      setAnalytics(data?.gradeAnalytics);
    } else {
      setError("No data available for this semester.");
    }
  } catch (err) {
    setError("Failed to fetch analytics data. Please try again later.");
    console.error("Error fetching analytics:", err);
  } finally {
    setIsLoading(false);
  }
};

if (isLoading) {
  return <LoadingPage />;
}

if (!isDeleteAuthorised) {
  return (
    <div className="flex items-center text-cyan-700">
      You are not authorised to be on this page...!
    </div>
  );
}

if (error) {
  return (
    <div>error</div>
    // <Alert variant="destructive">
    //   <AlertTitle>Error</AlertTitle>
    //   <AlertDescription>{error}</AlertDescription>
    // </Alert>
  );
}

if (!analytics) {
  return (
    <div> There is no analytics data available for the class and current semester.</div>

    // <Alert>
    //   <AlertTitle>No Data</AlertTitle>
    //   <AlertDescription>
    //     There is no analytics data available for the current semester.
    //   </AlertDescription>
    // </Alert>
  );
}



  return (
    <div className="space-y-6 text-cyan-800 pb-16">
      <h2 className="text-2xl font-bold text-cyan-700">
        {analytics?.className} Grade Analytics
      </h2>

      {/* Class Averages */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2 bg-gray-100 rounded-md p-1">
            <h3 className="font-semibold text-lg flex items-center">
              <FaChartBar className="text-cyan-500 mr-2" size={20} />
              Class Average
            </h3>
            <p className="text-3xl font-bold text-cyan-600">
              {analytics?.classAverage?.toFixed(2)}%
            </p>
          </div>
          <div className="space-y-2 bg-gray-100 rounded-md p-1">
            <h3 className="font-semibold text-lg flex items-center">
              <FaPercentage className="text-cyan-500 mr-2" size={20} />
              Highest Grade
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.highestGrade}%
            </p>
          </div>
          <div className="space-y-2 bg-gray-100 rounded-md p-1">
            <h3 className="font-semibold text-lg flex items-center">
              <FaPercentage className="text-cyan-500 mr-2" size={20} />
              Lowest Grade
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {analytics?.lowestGrade}%
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Class Averages</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics?.subjectAverages).map(
            ([subject, average]) => (
              <div
                key={subject}
                className="text-cyan-700 p-4 rounded-lg bg-gray-100 flex flex-col text-center shadow-lg"
              >
                <h4 className="font-semibold">{subject}</h4>
                <p className="text-2xl font-bold">{average}%</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Student Performance Over Time */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Student Performance Over Time
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.studentPerformanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageGrade"
                stroke="#0099CC"
                name="Average Grade"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Grade Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0099CC" name="Number of Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High and Low Performing Students */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Student Performance Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center">
              <FaArrowUp className="text-green-500 mr-2" /> Top Performers
            </h4>
            <ul className="space-y-2 uppercase">
              {analytics?.topPerformers.map((student) => (
                <li key={student.id} className="bg-green-100 p-2 rounded">
                  {student?.name}: {student?.averageGrade?.toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center">
              <FaArrowDown className="text-red-500 mr-2" /> Low Performers
            </h4>
            <ul className="space-y-2 uppercase">
              {analytics?.lowPerformers.map((student) => (
                <li key={student?.id} className="bg-red-100 p-2 rounded">
                  {student?.name}: {student?.averageGrade?.toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Grade Breakdown</h3>
        <CustomTable
          data={analytics?.gradeDistribution}
          headerNames={breakdownHeaderNames}
          maxTableHeight="40vh"
          height="20vh"
          displayActions={false}
          displaySearchBar={false}
        />
      </div>

      {/* Comparison of Student Performance Across Subjects */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Subject Performance Comparison
        </h3>
        <CustomTable
          data={analytics?.subjectPerformance}
          headerNames={performanceHeaderNames}
          maxTableHeight="40vh"
          height="20vh"
          displayActions={false}
          displaySearchBar={false}
        />
      </div>

      <div className="flex justify-between space-x-4 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ClassGradeAnalyticsPage;
