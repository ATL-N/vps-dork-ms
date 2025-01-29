// pages/dashboard/financial-management/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaChartLine,
  FaPlus,
  FaFileAlt,
  FaReceipt,
  FaLink,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "../../components/statcard";
import RecordExpense from "../../components/financialcomponent/record-expense";
import FinancialReports from "../../components/financialcomponent/FinancialReports";
import Modal from "../../components/modal/modal"; // Make sure you have this Modal component
import CustomTable from "../../components/listtableForm";
import { fetchData } from "../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";
import Addeditinventoryitem from "../inventory/addEditInventoryItem/addinventoryitem";
import Addeditinvoice from "./addEditInvoice/addinvoice";
import Viewinvoice from "./viewClassInvoice/viewclassinvoice";
import { FaBookOpenReader } from "react-icons/fa6";
import AddEditExpense from "../expenses/addeditexpense/addexpense";
import StudentBills from "./bills/studentbills";
// import LoadingPage from "../../components/generalLoadingpage";
import { useRouter } from "next/navigation";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const FinancialManagement = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [financialStats, setFinancialStats] = useState({});
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [dailyrevenue, setDailyrevenue] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [weeklyReportData, setWeeklyReportData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [activeSem, setActiveSem] = useState();
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session?.user?.activeSemester?.semester_id;
      setActiveSem(activeSemester);
      fetchFinancialStats(activeSemester);
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view finances"];

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
  }, [session]);

  const fetchFinancialStats = async (semester_id) => {
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
    setReportData(data?.monthlyReportData);
    setWeeklyReportData(data?.weeklyReportData);
    setRecentPayments(data?.recentPaymentsForCurrentSem);
    setRecentExpenses(data?.semesterExpensesForCurrentSem);
    setPieChartData(data?.semExpensesData);
    setDailyrevenue(data?.dailyRevenue);
  };

  const headerNames = [
    "id",
    "name",
    "amount",
    "category",
    "Initial balance",
    "Balance",
    "date",
  ];

  const expenseHeaderNames = ["id", "name", "amount", "Category", "date"];

  const handleAddInvoice = async () => {
    try {
      const [semesterData, classData] = await Promise.all([
        fetchData("/api/semester/all", "semester", false),
        fetchData("/api/classes/all", "staff"),
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

  const handleAddInventoryitem = async () => {
    try {
      const [semesterData, classData] = await Promise.all([
        fetchData("/api/semester/all", "semester"),
        fetchData("/api/classes/all", "staff"),
      ]);

      setModalContent(
        <div>
          <Addeditinventoryitem
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

  const handleViewStudentBills = async () => {
    try {
      // const [semesterData, classData] = await Promise.all([
      //   fetchData("/api/semester/all", "semester"),
      //   fetchData("/api/classes/all", "staff"),
      // ]);

      setModalContent(
        <div>
          <StudentBills
            // classData={classData?.classes}
            // semesterData={semesterData}
            onClose={() => {
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

  const handleViewInvoice = async () => {
    try {
      const [semesterData, classData] = await Promise.all([
        fetchData("/api/semester/all", "semester", false),
        fetchData("/api/classes/all", "staff", true),
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

  const handleOpenLink = (classId) => {
    console.log("class id", classId);

    setModalContent(
      <div>
        <LoadingPage />
      </div>
    );
    setShowModal(true);

    router.push(`/pages/financial/reports`);

    setShowModal(false);
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
        You are not authorised "view finances" to be on this page...!
      </div>
    );
  }

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Financial Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaFileInvoiceDollar />}
          title="Term's Total Revenue"
          value={`GHC ${
            financialStats?.totalRevenue?.toFixed(2).toLocaleString() || 0
          }`}
        />
        <StatCard
          icon={<FaChartLine />}
          title="Term's Expenses"
          value={`GHC ${financialStats?.totalExpenses?.toFixed(2) || 0}`}
        />
        <StatCard
          icon={<FaMoneyCheckAlt />}
          title="Outstanding Payments"
          value={`GHC ${
            financialStats?.outstandingPayments?.toFixed(2).toLocaleString() ||
            0
          }`}
        />
        <StatCard
          icon={<FaChartLine />}
          title="Today's Revenue"
          value={`GHC ${
            dailyrevenue?.totalDailyRevenue?.toFixed(2).toLocaleString() || 0
          }`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "add bills"
              )) && (
              <button
                onClick={handleAddInvoice}
                className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
              >
                <FaMoneyCheckAlt className="mx-auto mb-2 text-2xl" /> Add New
                Bill
              </button>
            )}

            
            <button
              onClick={handleViewStudentBills}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaBookOpenReader className="mx-auto mb-2 text-2xl" /> Student
              Bills
            </button>

            <button
              onClick={handleViewInvoice}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaFileAlt className="mx-auto mb-2 text-2xl" /> Class Bills
            </button>

            {/* <Link href="/dashboard/financial-management/record-payment"> */}
            {/* <button className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300">
              <FaMoneyCheckAlt className="mr-2" /> Record Payment
            </button> */}
            {/* <button
              onClick={handleAddExpense}
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaFileAlt className="mx-auto mb-2 text-2xl" /> Record Expense
            </button> */}
            <button
              onClick={handleOpenLink}
              className="p-4 bg-green-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaLink className="mx-auto mb-2 text-2xl" /> Financial Report
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Financial Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyReportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#ffc658"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Semester Payment History
        </h2>
        {recentPayments?.length > 0 ? (
          <CustomTable
            data={recentPayments}
            headerNames={headerNames}
            // handleDeleteStudent={handleDeleteStudent}
            maxTableHeight="40vh"
            height="20vh"
            // handleDelete={fetchRecentPayments}
            // handleEdit={fetchRecentPayments}
            // searchTerm={""}
            // handleSearch={fetchRecentPayments}
            displayActions={false}
            displaySearchBar={false}
          />
        ) : (
          <div>No fees received for the current semester / term</div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Semester Expenses History
          </h2>
          <button
            onClick={handleAddExpense}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Record Expense
          </button>
        </div>
        {recentExpenses?.length > 0 ? (
          <CustomTable
            data={recentExpenses}
            headerNames={expenseHeaderNames}
            // handleDeleteStudent={handleDeleteStudent}
            maxTableHeight="40vh"
            height="20vh"
            // handleDelete={fetchRecentPayments}
            // handleEdit={fetchRecentPayments}
            searchTerm={""}
            // handleSearch={fetchRecentPayments}
            displayActions={false}
            displaySearchBar={false}
          />
        ) : (
          <div>
            No Expenses recorded or made for the current semester / term
          </div>
        )}
      </div>
      {reportData?.length > 0 && (
        <FinancialReports reportdata={reportData} pieChartdata={pieChartData} />
      )}

      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setActiveSem(activeSem);
            fetchFinancialStats(activeSem);
          }}
        >
          {modalContent}
        </Modal>
      )}

      {showExpenseModal && (
        <Modal onClose={() => setShowExpenseModal(false)}>
          <RecordExpense onClose={() => setShowExpenseModal(false)} />
        </Modal>
      )}
    </div>
  );
};

export default FinancialManagement;
