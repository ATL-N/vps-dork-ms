// pages/dashboard/admin.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaBell,
  FaChartLine,
  FaUserPlus,
  FaFileAlt,
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
import StatCard from "../../../components/statcard";
import Modal from "../../../components/modal/modal";
import Addnewstudent from "../../students/add/addstudent";
import Addnewstaff from "../../staff/addnewstaff/addstaff";
import AddnewSubject from "../../subjects/add/addsubject";
import AddUserRole from "../../userroles/add/adduserrole";
import EditRolesAndPermissions from "../../users/asignRolesAndPermissions/assignrolesnpermissions";
import AssignUserRoles from "../../users/assignUsersRoles/assignuserroles";
import AddPermission from "../../permissions/add/addpermissions";
import AddNewDepartment from "../../department/add/adddepartment";
import Addeditsemester from "../../semester/add/addsemester";
import Addeditgradescheme from "../../grading/addgradescheme/addgradingscheme";
import Addnewclass from "../../classes/add/addclass";
import Addeditinvoice from "../../financial/addEditInvoice/addinvoice";
import Viewinvoice from "../../financial/viewClassInvoice/viewclassinvoice";
import Addeditevent from "../../events/addeditevent/addevent";
import TimetableManager from "../../timetable/addtimetable/addtimetable";
import TimetableViewer from "../../timetable/viewclassTimetable/viewtimtable";
import ViewUserHealthRecord from "../../health/viewhealthrecord/viewhealthrecord";
import AddEditUserHealthIncident from "../../health/addedithealthincident/addhealthincident";
import Addeditsupplier from "../../inventory/items/addsuppliers/addsuppliers";
import Sendnotification from "../../notification/add/addnotification";
import AddEditExpense from "../../expenses/addeditexpense/addexpense";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";

const AdminDashboard = () => {

  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [totalstudents, setTotalstudents] = useState(0);
  const [totalstaff, setTotalstaff] = useState(0);
  const [totalParents, setTotalParents] = useState(0);
  const [totalusers, setTotalusers] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [daillyRevenue, setDaillyRevenue] = useState(0);
  const [financialData, setFinancialData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [financialStats, setFinancialStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // const [rolesData, setRolesData] = useState(null);
  // const [permissionsData, setPermissionsData] = useState(null);

  useEffect(() => {
    if (session?.user?.roles?.includes("admin") || session?.user?.role==='admin' ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }

    console.log("session roles", session?.user?.roles[0]);
  }, [session]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session?.user?.activeSemester?.semester_id;
      // setActiveSem(activeSemester);
      fetchFinancialStats(activeSemester);
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    // Fetch data from your API
    fetchEnrollmentData();
    fetchFinancialData();
    fetchPerformanceData();
    fetchStaffData();
    fetchNotificationsData();
  }, []);

  const fetchFinancialStats = async (semester_id) => {
    console.log("running fetchFinancialStats");
    const data = await fetchData(
      `/api/finance/semfinamanagement/${semester_id}`,
      "",
      false
    );
    // Replace with actual API call
    const data1 = {
      totalRevenue: 500000,
      outstandingPayments: 50000,
      recentPayments: 25000,
      averagePaymentTime: 15,
    };

    // console.log("financial report data:", data);
    setFinancialStats(data?.stats);
    // setReportData(data?.monthlyReportData);
    // setWeeklyReportData(data?.weeklyReportData);
    // setRecentPayments(data?.recentPaymentsForCurrentSem);
    // setRecentExpenses(data?.semesterExpensesForCurrentSem);
    // setPieChartData(data?.semExpensesData);
        console.log("done running fetchFinancialStats");

  };

  const fetchNotificationsData = async () => {
        console.log("running fetchNotificationsData");

    const recentnotifications = await fetchData(
      "/api/notification/allnotifications",
      "",
      false
    );
    setNotifications(recentnotifications);
            console.log("done running fetchNotificationsData");

  };

  const fetchEnrollmentData = async () => {
    const enrolementData = await fetchData(
      "/api/statistics/studentscountbygrade",
      "enrolement",
      false
    );
    // console.log('enrolementData', enrolementData)

    // const data = [
    //   { grade: "Grade 1", students: 120 },
    //   { grade: "Grade 2", students: 115 },
    // ];
    setEnrollmentData(enrolementData?.gradeDistribution || []);
    setTotalstudents(enrolementData?.totalStudents || 0);
    setTotalstaff(enrolementData?.totalStaff || 0);
    setTotalParents(enrolementData?.totalParents || 0);
    setTotalusers(enrolementData?.totalUsers || 0);
  };

  const fetchFinancialData = async () => {
    const financialdata = await fetchData(
      "/api/statistics/financialdata",
      "financial",
      false
    );

    // const data = [
    //       { month: "Jan", income: 50000, expenses: 40000 },
    //       { month: "Feb", income: 55000, expenses: 42000 },
    //       { month: "Mar", income: 60000, expenses: 45000 },
    //       { month: "Apr", income: 58000, expenses: 43000 },
    //       { month: "May", income: 62000, expenses: 46000 },
    //     ];
    if(financialData){
      console.log('running financialdata')
      setFinancialData(financialdata?.yearlyData || []);
      setMonthlyRevenue(financialdata?.currentMonthRevenue || 0);
      setDaillyRevenue(financialdata?.currentDayRevenue || 0);
    }
    
  };

  const fetchPerformanceData = async () => {
    const performancedata = await fetchData(
      "/api/statistics/academicperformancedata",
      "academic",
      false
    );

    // const data = [
    //   { subject: "Math", averageScore: 85 },
    //   { subject: "Science", averageScore: 82 },
    //   { subject: "English", averageScore: 78 },
    //   { subject: "History", averageScore: 80 },
    // ];
    if(performanceData){
      console.log("running financialdata33445");

          setPerformanceData(performancedata || []);

    }
  };

  const fetchStaffData = async () => {
    const data = await fetchData(
      "/api/statistics/getstaffrolecount",
      "roles",
      false
    );

    const data1 = [
      { department: "Teaching", count: 50 },
      { department: "Administration", count: 15 },
      { department: "Support", count: 20 },
      { department: "Maintenance", count: 10 },
    ];
    setStaffData(data || []);
  };

  const handleAddStudent = async () => {
    try {
      const [parentsData, classesData] = await Promise.all([
        fetchData("/api/parents/getallparents", "parents", false),
        fetchData("/api/classes/all", "classes"),
      ]);
      setModalContent(
        <div>
          <Addnewstudent
            classesData={classesData?.classes}
            parentsData={parentsData}
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

  const handleAddExpense = async () => {
    try {
      const [staffdata, suppliersdata] = await Promise.all([
        fetchData("/api/staff/all", "staff"),
        fetchData("/api/inventory/suppliers/get", "suppliers", false),
      ]);
      setModalContent(
        <div>
          <AddEditExpense
            staffData={staffdata}
            suppliersData={suppliersdata}
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

  const handleAddStaff = () => {
    setModalContent(
      <div>
        <Addnewstaff />
      </div>
    );
    setShowModal(true);
  };

  const handleAddRole = () => {
    setModalContent(
      <div>
        <AddUserRole
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleAddEvent = () => {
    setModalContent(
      <div>
        <Addeditevent
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleCreateNotification = () => {
    setModalContent(
      <Sendnotification
        setShowModal={setShowModal}
        onCancel={() => {
          setShowModal(false);
          // fetchNotifications();
        }}
      />
    );
    setShowModal(true);
  };

  const handleRolesandPermissions = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        fetchData("/api/roles/all", "role", false),
        fetchData("/api/permission/all", "permissions", true),
      ]);
      setModalContent(
        <div>
          <EditRolesAndPermissions
            permissionsData={permissionsData}
            rolesData={rolesData}
            // rolePermissionData={}
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

  const handleUserRoles = async () => {
    try {
      const [rolesData, staffData] = await Promise.all([
        fetchData("/api/roles/all", "role", false),
        fetchData("/api/users/all", "users"),
      ]);

      setModalContent(
        <div>
          <AssignUserRoles
            usersData={staffData}
            rolesData={rolesData}
            // rolePermissionData={}
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

  const handleAddTimetable = async () => {
    // setIsLoading(true);

    try {
      const [classData, staffData, subjectsData, semesterData] =
        await Promise.all([
          fetchData("/api/classes/all", "classes", false),
          fetchData("/api/staff/all", "staff details", false),
          fetchData("/api/subjects/allsubjects", "subject details", false),
          fetchData("/api/semester/all", "semester", true),
        ]);

      setModalContent(
        <div>
          <TimetableManager
            staffData={staffData}
            classesData={classData?.classes}
            subjectsData={subjectsData}
            semesterData={semesterData}
            onCancel={() => {
              setShowModal(false);
            }}
          />
        </div>
      );
    } catch (err) {
      console.log("Error fetching data:", err);
    } finally {
      setShowModal(true);
      // setIsLoading(false);
    }
  };

  const handleViewClassTimetable = async () => {
    try {
      const [classData, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "timetable", false),
        fetchData("/api/semester/all", "semester", true),
      ]);

      setModalContent(
        <div>
          <TimetableViewer
            classesData={classData?.classes}
            semesterData={semesterdata}
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

  const handleAddInvoice = async () => {
    try {
      const [semesterData, classData] = await Promise.all([
        fetchData("/api/semester/all", "semester", false),
        fetchData("/api/classes/all", "staff", true),
      ]);

      setModalContent(
        <div>
          <Addeditinvoice
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

  // const handleAddInventoryitem = async () => {
  //   try {
  //     const [semesterData, classData] = await Promise.all([
  //       fetchData("/api/semester/all", "semester"),
  //       fetchData("/api/classes/all", "staff"),
  //     ]);

  //     setModalContent(
  //       <div>
  //         <Addeditinventoryitem
  //           classData={classData?.classes}
  //           semesterData={semesterData}
  //           onCancel={() => {
  //             setShowModal(false);
  //           }}
  //         />
  //       </div>
  //     );
  //   } catch (err) {
  //     console.log("Error fetching teacher data:", err);
  //   } finally {
  //     setShowModal(true);
  //   }
  // };

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

  const handleAddDepartment = async () => {
    try {
      const [staffData] = await Promise.all([
        fetchData("/api/staff/all", "staff"),
      ]);

      setModalContent(
        <div>
          <AddNewDepartment
            staffData={staffData}
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

  const handleAddClass = async () => {
    try {
      const [staffData] = await Promise.all([
        fetchData("/api/staff/all", "staff"),
      ]);

      setModalContent(
        <div>
          <Addnewclass
            staffData={staffData}
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

  const handleViewHealthRecord = async () => {
    try {
      const [usersData] = await Promise.all([
        fetchData("/api/users/all", "users"),
      ]);

      setModalContent(
        <div>
          <ViewUserHealthRecord
            usersData={usersData}
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

  const handleAddSupplier = async () => {
    try {
      setModalContent(
        <div>
          <Addeditsupplier
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

  const handleAddHealthIncident = async () => {
    try {
      const [usersData] = await Promise.all([
        fetchData("/api/users/all", "users"),
      ]);

      setModalContent(
        <div>
          <AddEditUserHealthIncident
            usersData={usersData}
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

  const handleAddPermission = () => {
    setModalContent(
      <div>
        <AddPermission
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleAddSemester = () => {
    setModalContent(
      <div>
        <Addeditsemester
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleAddGradingScheme = () => {
    setModalContent(
      <div>
        <Addeditgradescheme
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </div>
    );
    setShowModal(true);
  };

  const handleAddSubject = async () => {
    try {
      setModalContent(
        <AddnewSubject
          setShowModal={setShowModal}
          onCancel={() => {
            setShowModal(false);
          }}
        />
      );
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      setShowModal(true);
    }
  };

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page...!
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <>
      <div className="pb-16">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link href="/pages/students" className="hover:text-cyan-400">
            <StatCard
              icon={<FaUserGraduate />}
              title="Total Students"
              value={totalstudents}
              isButton={true}
            />
          </Link>
          <Link href="/pages/staff" className="hover:text-cyan-400">
            <StatCard
              icon={<FaChalkboardTeacher />}
              title="Total Staff"
              value={`${totalstaff}`}
              isButton={true}
            />
          </Link>
          <Link href="/pages/parents" className="hover:text-cyan-400">
            <StatCard
              icon={<FaChalkboardTeacher />}
              title="Total Parents"
              value={`${totalParents}`}
              isButton={true}
            />
          </Link>
          <Link href="/pages/users" className="hover:text-cyan-400">
            <StatCard
              icon={<FaChalkboardTeacher />}
              title="Total Users"
              value={`${totalusers}`}
              isButton={true}
            />
          </Link>

          {/* <StatCard icon={<FaUsers />} title="Total Users" value={totalusers} /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaMoneyCheckAlt />}
            title="Outstanding Payments"
            value={`GHC ${
              financialStats?.outstandingPayments
                ?.toFixed(2)
                .toLocaleString() || 0
            }`}
          />
          <StatCard
            icon={<FaMoneyBillWave />}
            title="Month's Revenue"
            value={`GHC ${monthlyRevenue?.toFixed(2)}`}
          />
          <StatCard
            icon={<FaChartLine />}
            title="Today's Expenses"
            value={`GHC ${financialStats?.totalExpensesToday?.toFixed(2) || 0}`}
          />
          <StatCard
            icon={<FaChartLine />}
            title="Today's Revenue"
            value={`GHC ${
              financialStats?.totalPaymentsToday?.toFixed(2).toLocaleString() ||
              0
            }`}
          />
          {/* <StatCard icon={<FaUsers />} title="Total Users" value={totalusers} /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow overflow-auto max-h-[60vh]">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddStudent}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaUserPlus className="mx-auto mb-2 text-2xl" /> Add Student
              </button>

              <button
                onClick={handleAddStaff}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaUserPlus className="mx-auto mb-2 text-2xl" /> Add Staff
              </button>

              <button
                onClick={handleAddEvent}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaMoneyBillWave className="mx-auto mb-2 text-2xl" /> Add Event
              </button>

              {/* <button
                onClick={handleGenerateReport}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Generate Report
              </button> */}

              <button
                onClick={handleAddInvoice}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add New Bill
              </button>

              {/* <button
                onClick={handleAddInventoryitem}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Inventory
              </button> */}

              {/* <button
                onClick={handleAddDepartment}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Department
              </button> */}

              <button
                onClick={handleAddClass}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Class
              </button>

              <button
                onClick={handleAddSubject}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add subject
              </button>

              <button
                onClick={handleAddGradingScheme}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Grading
                Scheme
              </button>

              <button
                onClick={handleAddSemester}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Semester
              </button>

              <button
                onClick={handleAddRole}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Role
              </button>

              <button
                onClick={handleAddPermission}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Permision
              </button>

              <button
                onClick={handleRolesandPermissions}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Assign Role
                Permissions
              </button>

              <button
                onClick={handleUserRoles}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Assign user
                Roles
              </button>

              <button
                onClick={handleAddTimetable}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Timetable
              </button>

              <button
                onClick={handleViewClassTimetable}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> View Timetable
              </button>

              <button
                onClick={handleViewInvoice}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> View Bill
              </button>

              <button
                onClick={handleViewHealthRecord}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> View Health
                Details
              </button>

              <button
                onClick={handleAddHealthIncident}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Health
                Incident
              </button>

              <button
                onClick={handleAddSupplier}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add Supplier
              </button>

              <button
                onClick={handleAddExpense}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Record Expense
              </button>

              <button
                onClick={handleCreateNotification}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaFileAlt className="mx-auto mb-2 text-2xl" /> Add notification
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow overflow-auto hover:text-cyan-500 max-h-[60vh]">
            <Link href={"/pages/notification"}>
              <h2 className="text-xl font-semibold mb-4 text-cyan-700">
                Recent Notifications
              </h2>
              {isLoading ? (
                <LoadingPage />
              ) : (
                <ul>
                  {notifications?.map((notification, index) => (
                    <li
                      key={index}
                      className="mb-2 pb-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center">
                        <FaBell className="text-cyan-500 mr-2" />
                        <span className="font-semibold">
                          {notification.notification_title}
                        </span>
                      </div>
                      <p className="ml-6 text-sm text-gray-600">
                        {new Date(notification.sent_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Staff Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={staffData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  // innerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ department, count }) => `${department}: ${count}`}
                >
                  {staffData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Financial Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#8884d8" />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Academic Performance
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
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-cyan-700">
              Enrollment by Grade
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"></div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default AdminDashboard;
