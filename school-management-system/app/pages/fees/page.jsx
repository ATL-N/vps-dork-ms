"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaUserGraduate,
  FaCalendarAlt,
  FaClipboardList,
  FaPrint,
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
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import CustomTable from "../../components/listtableForm";
import AddNewFee from "./add/addfees";
import { fetchData, getTodayString } from "../../config/configFile";
import LoadingPage from "../../components/generalLoadingpage";
import { useSession } from "next-auth/react";
import StudentPaymentHistory from "./studentpaymenthistory/paymenthistory";
import AddEditExpense from "../expenses/addeditexpense/addexpense";
import ReceiptGenerator from "./feereceipt/feereceipt";

const FeesManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [fees, setFees] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [feeStats, setFeeStats] = useState([]);
  const [expenseStats, setExpenseStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");
  const [searchQuery1, setSearchQuery1] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [activeSemester, setActiveSemester] = useState();
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activesem = session?.user?.activeSemester?.semester_id;
      setIsLoading(true);
      setActiveSemester(activesem);
      fetchFees();
      fetchPaymentHistory("", activesem);
      fetchExpenseHistory();
      fetchFeeStats();
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view fees"];

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

  const fetchFees = async (searchQuery1 = "") => {
    // const toastId = toast.loading("Fetching fees...");

    try {
      // setIsLoading(true);
      setError(null);

      let url = "/api/fees/getfees";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const data = await fetchData(url, "", false);
      // if (!data.ok) {
      //   throw new Error("Failed to fetch fees");
      // }

      // const data = await response.json();
      setFees(data);

      if (searchQuery1.trim() !== "" && data?.length === 0) {
        setError("No fees found matching your search.");
      } else {
        // toast.update(toastId, {
        //   render: `Successfully fetched ${data.length} fee records`,
        //   type: "success",
        //   isLoading: false,
        //   autoClose: 3000,
        // });
      }
    } catch (err) {
      setError(err.message);
      // toast.update(toastId, {
      //   render: `Error: ${err.message}`,
      //   type: "error",
      //   isLoading: false,
      //   autoClose: 3000,
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async (searchQuery1 = "", semester_id) => {
    try {
      let url = `/api/fees/getpaymenthistory/${semester_id}`;
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const data = await fetchData(url, "", false);

      setPaymentHistory(data);

      if (searchQuery1.trim() !== "" && data.length === 0) {
        setError("No fees found matching your search.");
      } else {
      }
    } catch (err) {
      setError(err.message);
    } finally {
      // setIsLoading(false);
    }
  };

  const fetchExpenseHistory = async (expenseSearchQuery = "", semester_id) => {
    try {
      let url = `/api/finance/getexpenses/`;
      if (expenseSearchQuery.trim() !== "") {
        url += `?query=${encodeURIComponent(expenseSearchQuery)}`;
      }

      const data = await fetchData(url, "", false);

      setExpenseHistory(data);

      if (expenseSearchQuery.trim() !== "" && data.length === 0) {
        setError("No fees found matching your search.");
      } else {
      }
    } catch (err) {
      setError(err.message);
    } finally {
      // setIsLoading(false);
    }
  };

  const fetchFeeStats = async () => {
    // setIsLoading(true);
    try {
      const [feeStatsData, dayStatsData] = await Promise.all([
        fetchData("/api/statistics/financialdata", "", false),
        fetchData(`/api/finance/dayfinmanagement`, "", false),
      ]);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch fee statistics");
      // }
      // const feeStatsData = await response.json();
      setFeeStats(dayStatsData?.stats);
      setExpenseStats(dayStatsData?.weeklyExpensesData);
      // console.log(dayStatsData)
    } catch (err) {
      console.error("Error fetching fee statistics:", err);
      toast.error("Failed to fetch fee statistics");
    } finally {
      // setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchFees(e.target.value);
  };

  const handleHistorySearchInputChange = (e) => {
    setSearchQuery1(e.target.value);
    fetchPaymentHistory(e.target.value, activeSemester);
  };

  const handleExpenseSearchInputChange = (e) => {
    setExpenseSearchQuery(e.target.value);
    fetchExpenseHistory(e.target.value);
  };

  const handleAddFee = async (student_id) => {
    try {
      // const [studentsData] = await Promise.all([
      //   fetchData(`/api/fees/getfees//${student_id}`, "students"),
      // ]);
      const studentsdata = await fees?.filter(
        (fee) => fee.student_id === student_id
      );
      console.log("studentsdata", studentsdata);

      setModalContent(
        <AddNewFee
          setShowModal={setShowModal}
          onCancel={() => {
            setShowModal(false);
            fetchFees();
            fetchPaymentHistory("", activeSemester);
            fetchExpenseHistory();
            fetchFeeStats();
          }}
          student_id={student_id}
          studentsData={studentsdata[0]}
        />
      );
    } catch (error) {
      console.log(error);
    } finally {
      setShowModal(true);
    }
    setShowModal(true);
  };

   const handleEditFee = async (collection_id) => {
     try {
       // const [studentsData] = await Promise.all([
       //   fetchData(`/api/fees/getfees//${student_id}`, "students"),
       // ]);
      //  const studentsdata = await fees?.filter(
      //    (fee) => fee.student_id === student_id
      //  );
      //  console.log("studentsdata", studentsdata);

       const studentsdata = paymentHistory?.filter(
         (payment) => payment.collection_id === collection_id
       );
       console.log("studentsdata", studentsdata);

       setModalContent(
         <AddNewFee
           setShowModal={setShowModal}
           onCancel={() => {
             setShowModal(false);
             fetchFees();
             fetchPaymentHistory("", activeSemester);
             fetchExpenseHistory();
             fetchFeeStats();
           }}
           student_id={studentsdata[0]?.handleEditFee}
           studentsData={studentsdata[0]}
           payment_id={collection_id}
         />
       );
     } catch (error) {
       console.log(error);
     } finally {
       setShowModal(true);
     }
     setShowModal(true);
   };

  const handlePrintFee = async (collection_id) => {
    try {
      const receiptdata = paymentHistory?.filter(
        (payment) => payment.collection_id === collection_id
      );
      console.log("receiptData", receiptdata);
      setReceiptData(receiptdata[0]);
      setShowReceipt(true);
      // setModalContent(
      //   <ReceiptGenerator
      //     receiptData={receiptData}
      //     onClose={setShowModal(false)}
      //   />
      // );
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditExpense = async (expense_id) => {
    const expense = expenseHistory.find((expense) => expense.id === expense_id);

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
            id={expense_id}
            expenseData={expense}
            onCancel={() => {
              setShowModal(false);
              fetchExpenseHistory();
            }}
          />
        </div>
      );
    } catch (err) {
      console.log(err);
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
              fetchPaymentHistory("", activeSemester);
              fetchExpenseHistory();
              fetchFeeStats();
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

  const handleFeeHistoryById = async (student_id) => {
    try {
      setModalContent(
        <StudentPaymentHistory
          student_id={student_id}
          onClose={() => {
            setShowModal(false);
          }}
        />
      );
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching fee details:", err);
      toast.error("Failed to fetch fee details");
    }
  };

  const handleExpenseHistoryById = async (student_id) => {
    try {
      setModalContent(
        <StudentPaymentHistory
          student_id={student_id}
          onClose={() => {
            setShowModal(false);
          }}
        />
      );
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching fee details:", err);
      toast.error("Failed to fetch fee details");
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (window.confirm("Are you sure you want to delete this fee?")) {
      try {
        const response = await fetch(`/api/fees/delete/${feeId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete fee");
        }

        toast.success("Fee deleted successfully");
        fetchFees();
        fetchFeeStats();
      } catch (err) {
        console.error("Error deleting fee:", err);
        toast.error("Failed to delete fee");
      }
    }
  };

  const extractFeeData = (data) => {
    // console.log(data)
    if (data?.length > 0) {
      return data.map((item) => ({
        id: item.student_id,
        student_name: `${item.last_name} ${item.first_name} ${item.other_names}`,
        class_name: item.class_name,
        amount: `GHC ${-parseFloat(item?.amountowed)?.toFixed(2)}`,
        // status: item.status,
      }));
    }
  };

  const headerNames = [
    "ID",
    "Student Name",
    "Class",
    "Fees Owed(GHC)",
    // "Status",
  ];

  const extractPaymentHistoryData = (data) => {
    if (data?.length > 0) {
      return data.map((item) => ({
        id: item.collection_id,
        student_name: item.student_name,
        class_name: item.class_name,
        old_balance: `GHC ${-item.old_balance}`,
        new_balance: `GHC ${-item.new_balance}`,
        amount_received: `GHC ${item.amount_received}`,
        payment_date: item.payment_date,
        received_by: item?.receiver_name,
      }));
    }
  };

  const historyheaderNames = [
    "ID",
    "Student Name",
    "Class",
    "Old Balance(GHC)",
    "New Balance(GHC)",
    "Amount Received(GHC)",
    "Date",
    "Received By",
  ];

  const extractExpenseData = (data) => {
    if (data?.length > 0) {
      return data.map((item) => ({
        id: item.id,
        recipient_name: item.recipient_name,
        expense_category: item.expense_category,
        amount: `GHC ${item.amount}`,
        expense_date: item.expense_date,
        description: item.description,
        user_name: item?.user_name,
      }));
    }
  };

  const expenseheaderNames = [
    "ID",
    "Recipient Name",
    "Category",
    "Amount(GHC)",
    "Transaction Date(GHC)",
    "Description",
    "Issued By",
  ];

  if (status === "loading") {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "view fees" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Fees Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaMoneyBillWave />}
            title="No. of Daily Payers"
            value={feeStats?.dailyPayers || 0}
          />
          <StatCard
            icon={<FaUserGraduate />}
            title="Fees received today"
            value={feeStats?.dailyRevenue?.toFixed(2) || 0}
          />
          <StatCard
            icon={<FaMoneyBillWave />}
            title="Day's Expenses"
            value={feeStats?.dailyExpenses?.toFixed(2) || 0}
          />
          <StatCard
            icon={<FaCalendarAlt />}
            title="Outstanding Fees"
            value={feeStats?.outstandingPayments?.toFixed(2) || 0}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<FaMoneyBillWave />}
            title="No. of Week's Payers"
            value={feeStats?.weeklyPayers || 0}
          />
          <StatCard
            icon={<FaUserGraduate />}
            title="Week Revenue"
            value={feeStats?.weeklyRevenue?.toFixed(2) || 0}
          />
          <StatCard
            icon={<FaMoneyBillWave />}
            title="Week's Expenses"
            value={feeStats?.weeklyExpenses?.toFixed(2) || 0}
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Students Fee Records
            </h2>
          </div>
          <div className="overflow-x-auto tableWrap">
            {isLoading ? (
              <LoadingPage />
            ) : (
              <CustomTable
                data={extractFeeData(fees)}
                headerNames={headerNames}
                maxTableHeight="40vh"
                height="20vh"
                handleEdit={handleAddFee}
                handleEvaluation={handleFeeHistoryById}
                handleSearch={handleSearchInputChange}
                searchTerm={searchQuery}
                editIcon={<FaMoneyBillWave size={26} />}
                editTitle="Receive Payment for "
                searchPlaceholder="Search by student name or class name"
                displayDetailsBtn={false}
                displayDelBtn={false}
                displayEvaluationBtn={true}
                displayEditBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "take fees"
                  )
                }
                evalTitle="View payment history for "
                evaluationIcon={<FaClipboardList />}
              />
            )}
          </div>
          <div className="pt-2 text-red-500">
            *All negative(-) values are amount owed by the pupil.{" "}
            <p className="text-green-600">
              *Positive values are carry forwards
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Payment History
            </h2>
          </div>

          <div className="overflow-x-auto tableWrap">
            {isLoading ? (
              <LoadingPage />
            ) : (
              <CustomTable
                data={extractPaymentHistoryData(paymentHistory)}
                headerNames={historyheaderNames}
                maxTableHeight="40vh"
                height="20vh"
                handleSearch={handleHistorySearchInputChange}
                handleDetails={handlePrintFee}
                handleEdit={handleEditFee}
                searchTerm={searchQuery1}
                editTitle="Edit fee with id "
                detailsTitle="Print receipt for fees with id: "
                searchPlaceholder="Search by student name, or class name"
                displayDetailsBtn={true}
                displayDelBtn={false}
                displayEditBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "delete student"
                  )
                }
                displayActions={true}
                // editIcon={<FaPrint />}
                detailsIcon={<FaPrint />}
              />
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Expenses Records
            </h2>

            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "add expense"
              )) && (
              <button
                onClick={handleAddExpense}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Record Expense
              </button>
            )}
          </div>
          <div className="overflow-x-auto tableWrap">
            {isLoading ? (
              <LoadingPage />
            ) : (
              <CustomTable
                data={extractExpenseData(expenseHistory)}
                headerNames={expenseheaderNames}
                maxTableHeight="40vh"
                height="20vh"
                handleEdit={handleEditExpense}
                handleEvaluation={handleExpenseHistoryById}
                handleSearch={handleExpenseSearchInputChange}
                searchTerm={expenseSearchQuery}
                editTitle="Receive expense for "
                searchPlaceholder="Search by recipient name or class name or category or description or issuer"
                displayDetailsBtn={false}
                displayDelBtn={false}
                displayEvaluationBtn={false}
                evalTitle="View expense history for "
                displayActions={true}
                displayEditBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "edit expense"
                  )
                }
                // evaluationIcon={<FaClipboardList />}
              />
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
           Today's Expenses Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseStats}>
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
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            fetchFees();
            fetchPaymentHistory("", activeSemester);
            fetchExpenseHistory();
            fetchFeeStats();
          }}
        >
          {modalContent}
        </Modal>
      )}

      {showReceipt && (
        <ReceiptGenerator
          receiptData={receiptData}
          printDirect={true}
          onClose={() => {
            setShowReceipt(false);
            // onCancel();
          }}
        />
      )}
    </>
  );
};

export default FeesManagement;
