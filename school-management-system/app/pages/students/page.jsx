// pages/dashboard/students/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaUserPlus,
  FaEdit,
  FaInfoCircle,
  FaCalendarCheck,
  FaChartBar,
  FaClipboardList,
  FaStar,
  FaExclamationTriangle,
  FaHeartbeat,
  FaTrashAlt,
  FaMale,
  FaFemale,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import DeleteUser from "../../components/deleteuser";
import Addnewstudent from "./add/addstudent";
import Studentprofilepage from "./studentprofile/studentprofile";
import CustomTable from "../../components/listtableForm";
import { toast } from "react-toastify";
import { fetchData } from "../../config/configFile";
import {
  Card,
  CardContent,
  CardHeader,
  Progress,
} from "../../components/attendancecard";
import { useSession } from "next-auth/react";
import Loadingpage from "../../components/Loadingpage";
import LoadingPage from "../../components/generalLoadingpage";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const StudentManagement = () => {
  const { data: session, status } = useSession();

  const [students, setStudents] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [error, setError] = useState("");
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [totalstudents, setTotalstudents] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeDistributionData, setGradeDistributionData] = useState();
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view students"];

    // console.log("session?.user?.role", session?.user?.role);
    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      session?.user?.role === "admin" ||
      session?.user?.roles?.some((role) => authorizedRoles.includes(role))
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  //  if (isLoading) {
  //    return <Loadingpage />;
  //  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchStudents(searchQuery);
  };

  // const handleDeleteStudent = (student) => {
  //   setSelectedStudent(student);
  //   setModalContent("delete");
  //   setShowModal(true);
  // };

  useEffect(() => {
    setIsLoading(true);
    fetchStudents();
    fetchStudentStats();
    fetchEnrollmentData();
    setIsLoading(false);
  }, []);

  const headerNames = [
    "id",
    "Name",
    "Gender",
    "Date of birth",
    "Phone",
    "class",
  ];

  const fetchStudents = async (searchQuery1 = "") => {
    try {
      let url = "/api/students/getstudents";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      function extractData(data) {
        return data.map((student) => ({
          id: student.id,
          name: `${student.last_name.trim()} ${student.first_name.trim()} ${student.other_names.trim()}`,
          gender: student.gender,
          date_of_birth: student.date_of_birth,
          phone: student.phone,
          class: student.class,
        }));
      }

      setStudents(extractData(data));
      setIsLoading(false);

      if (searchQuery1.trim() !== "" && data.length === 0) {
        setError("No students found matching your search.");
      } else {
        // toast.update(toastId, {
        //   render: `Successfully fetched ${data.length} teacher(s)`,
        //   type: "success",
        //   isLoading: false,
        //   autoClose: 3000,
        // });
        console.log(data.length);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollmentData = async () => {
    const enrolementData = await fetchData(
      "/api/statistics/studentscountbygrade",
      "enrolement",
      false
    );

    setEnrollmentData(enrolementData?.gradeDistribution);
    setTotalstudents(enrolementData?.totalStudents);
  };

  const fetchStudentStats = async () => {
    try {
      const response = await fetch(
        "/api/statistics/overallattendanceandacademicsdata"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch student stats");
      }
      const data = await response.json();

      // Assuming the API returns an array of objects with class_name and count
      // const formattedData = data.map((item) => ({
      //   grade: item.class_name,
      //   count: item.count,
      // }));

      setStudentStats(data);

      setGradeDistributionData(
        data?.academic.gradeDistribution.map((grade) => ({
          name: grade.grade_name,
          value: parseFloat(grade.percentage),
        }))
      );

      // console.log("gradeDistributionData", gradeDistributionData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddStudent = async () => {
    try {
      const [parentsData, classesData, pickupData] = await Promise.all([
        fetchData("/api/parents/getallparents", "", false),
        fetchData("/api/classes/all", "", false),
        fetchData("/api/feedingNtransport/pickup/get", "", true),
      ]);
      setModalContent(
        <div>
          <Addnewstudent
            classesData={classesData?.classes || []}
            parentsData={parentsData || []}
            pickupData={pickupData || []}
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

  const handleDeleteStudent = async (student_id) => {
    if (
      !(
        session?.user?.role === "admin" ||
        session?.user?.permissions?.some(
          (permission) => permission === "delete student"
        )
      )
    ) {
      return (
        <div className="flex items-center">
          You are not authorised "delete student" to be on this page
        </div>
      );
    }
    try {
      console.log("handleDeleteStudent", student_id);
      // const [parentsData, classesData] = await Promise.all([
      //   fetchData("/api/parents/getallparents", "", false),
      //   fetchData("/api/classes/all", "", true),
      // ]);
      setModalContent(
        <div>
          <DeleteUser
            userData={student_id}
            onClose={() => setShowModal(false)}
            onDelete={async () => {
              const toastId = toast.loading("Processing your request...");

              try {
                const response = await fetch(
                  `/api/students/deletestudent/${student_id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    // body: JSON.stringify(staffData),
                  }
                );

                if (!response.ok) {
                  // throw new Error(
                  //   id ? "Failed to delete staff" : "Failed to add staff"
                  // );

                  toast.update(toastId, {
                    render: "Failed to delete student.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                  });
                }

                // Add API call to delete teacher
                // console.log("Deleting teacher:", student_id);
                await fetchStudents();
                // toast.success("Staff deleted successfully...");
                toast.update(toastId, {
                  render: "student deleted successfully...",
                  type: "success",
                  isLoading: false,
                  autoClose: 2000,
                });
                setShowModal(false);
                // alert("Teacher deleted successfully!");
              } catch (error) {
                console.error("Error deleting student:", error);
                // toast.error("An error occurred. Please try again.");
                toast.update(toastId, {
                  render: "An error occurred. Please try again.",
                  type: "error",
                  isLoading: false,
                  autoClose: 2000,
                });

                // alert("An error occurred. Please try again.");
              }
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
      const [parentsData, classesData, studentsData, pickupData] = await Promise.all([
        fetchData("/api/parents/getallparents", "", false),
        fetchData("/api/classes/all", "", false),
        fetchData(`/api/students/${student_id}`, "", false),
        fetchData("/api/feedingNtransport/pickup/get", "", true),
      ]);
      setModalContent(
        <div>
          <Addnewstudent
            classesData={classesData?.classes}
            parentsData={parentsData}
            pickupData={pickupData}
            id={student_id}
            studentsData={studentsData}
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

  const handleViewProfile = async (student_id) => {
    try {
      const [parentsData, classesData, studentsData, pickupData] =
        await Promise.all([
          fetchData("/api/parents/getallparents", "", false),
          fetchData("/api/classes/all", "", false),
          fetchData(`/api/students/${student_id}`, "", false),
          fetchData("/api/feedingNtransport/pickup/get", "", true),
        ]);
      setModalContent(
        <div>
          <Addnewstudent
            classesData={classesData?.classes}
            parentsData={parentsData}
            pickupData={pickupData}
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

  const handleViewextendeddetails = async (student_id) => {
    if (
      !(
        session?.user?.role === "admin" ||
        session?.user?.permissions?.some(
          (permission) => permission === "view srudents"
        )
      )
    ) {
      return (
        <div className="flex items-center">
          You are not authorised "view students" to be on this page
        </div>
      );
    }
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
        You are not authorised "view students" to be on this page
      </div>
    );
  }

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Student Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<FaUserGraduate />}
          title="Total Students"
          value={totalstudents || 0}
          isButton={false}
        />
        <StatCard
          icon={<FaMale />}
          title="Total Male"
          value={studentStats?.studentCount?.male_count || 0}
          isButton={false}
        />

        <StatCard
          icon={<FaFemale />}
          title="Total Female"
          value={studentStats?.studentCount?.female_count || 0}
          isButton={false}
        />

        <StatCard
          icon={<FaCalendarCheck />}
          title="Avg. Attendance"
          value={
            parseFloat(
              studentStats?.attendance?.overall?.average_attendance_rate
            ).toFixed(2) || 0
          }
        />
        <StatCard
          icon={<FaStar />}
          title="Avg. Score"
          value={
            parseFloat(
              studentStats?.academic?.overall?.school_average_score
            ).toFixed(2) || 0
          }
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">Student List</h2>
          {(session?.user?.role === "admin" ||
            session?.user?.permissions?.some(
              (permission) => permission === "add student"
            )) && (
            <button
              onClick={handleAddStudent}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
            >
              <FaUserPlus className="mr-2" /> Add New Student
            </button>
          )}
        </div>
        <div className="overflow-x-auto tableWrap">
          {!isLoading ? (
            <CustomTable
              data={students}
              headerNames={headerNames}
              maxTableHeight="40vh"
              height="20vh"
              handleDelete={handleDeleteStudent}
              handleDetails={handleViewProfile}
              handleEdit={handleEditStudent}
              handleSearch={handleSearchInputChange}
              searchTerm={searchQuery}
              searchPlaceholder="search student with name or class or phone"
              displayEvaluationBtn={true}
              handleEvaluation={handleViewextendeddetails}
              evalTitle="View extended details for "
              displayActions={true}
              displayEditBtn={
                session?.user?.role === "admin" ||
                session?.user?.permissions?.some(
                  (permission) => permission === "add student"
                )
              }
              displayDelBtn={
                session?.user?.role === "admin" ||
                session?.user?.permissions?.some(
                  (permission) => permission === "edit collected fees"
                )
              }
            />
          ) : (
            <Loadingpage />
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow my-6">
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Student Distribution by Class
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={enrollmentData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#8884d8" name="Number of Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>Attendance Trend (Last 30 Days)</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studentStats?.attendance?.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attendance_date" name="attendance date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present_count"
                  stroke="#8884d8"
                />
                <Line type="monotone" dataKey="absent_count" stroke="#82ca9d" />
                <Line type="monotone" dataKey="late_count" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Attendance Rate by Class</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentStats?.attendance?.byClass}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="attendance_rate"
                  fill="#8884d8"
                  name={"attendance rate"}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>Average Score by Subject</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentStats?.academic?.bySubject}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="average_score"
                  name="average score"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Grade Distribution</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {gradeDistributionData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default StudentManagement;
