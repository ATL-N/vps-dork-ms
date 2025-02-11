"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaMoneyBillWave,
  FaPlus,
  FaUserGraduate,
  FaCalendarAlt,
  FaClipboardList,
  FaPrint,
  FaEdit,
  FaInfoCircle,
} from "react-icons/fa";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import CustomTable from "../../components/listtableForm";
import FeeCollectionPage from "./add/addfeedingfee";
import { fetchData } from "../../config/configFile";
import LoadingPage from "../../components/generalLoadingpage";
import { useSession } from "next-auth/react";
import StudentPaymentHistory from "./studentpaymenthistory/paymenthistory";
import AddEditExpense from "../expenses/addeditexpense/addexpense";
import ReceiptGenerator from "./feereceipt/feereceipt";
import { getTodayString } from "../../config/configFile";
import Addeditpickup from "./pickup/addedit/addeditpickup";
import DeleteUser from "../../components/deleteuser";

const FeedingFeesManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [fees, setFees] = useState([]);
  const [pickUpPoints, setPickUpPoints] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [feedingbycollectorhistory, setFeedingbycollectorhistory] = useState(
    []
  );
  const [feeStats, setFeeStats] = useState([]);
  const [expenseStats, setExpenseStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pickUpSearchQuery, setPickUpSearchQuery] = useState("");
  const [searchQuery1, setSearchQuery1] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [activeSemester, setActiveSemester] = useState();
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [classesData, setClassesData] = useState([]);
  const [stats, setStats] = useState([]);
  const today = getTodayString();

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
      // fetchExpenseHistory();
      fetchFeeStats();
      fetchClasses();
      fetchPickupPoints();
      // fetchstats(today)
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view feeding fee and tnt"];

    console.log("session data:", session);

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
  }, [session, status]);

  const fetchPickupPoints = async (searchQuery1 = "") => {
    // const toastId = toast.loading("Fetching fees...");

    try {
      // setIsLoading(true);
      setError(null);

      let url = "/api/feedingNtransport/pickup/get";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const data = await fetchData(url, "", false);
      setPickUpPoints(data);
      if (searchQuery1.trim() !== "" && data?.length === 0) {
        setError("No fees found matching your search.");
      } else {
        console.log("error");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const classData = await fetchData("/api/classes/all", "classes", false);
      setClassesData(classData?.classes);
      // console.log("classData", classData?.classes);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFees = async (searchQuery1 = "") => {
    // const toastId = toast.loading("Fetching fees...");

    try {
      // setIsLoading(true);
      setError(null);

      let url = "/api/feedingNtransport/getfeedingntransportdet";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const data = await fetchData(url, "", false);
      setFees(data);
      if (searchQuery1.trim() !== "" && data?.length === 0) {
        setError("No fees found matching your search.");
      } else {
        console.log("error");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async (searchQuery1 = "", semester_id) => {
    try {
      let url = `/api/feedingNtransport/getSemesterSummary?semester_id=${semester_id}`;
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      let url2 = `/api/feedingNtransport/getStaffCollections?semester_id=${semester_id}`;
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      // const data = await fetchData(url, "", false);

      const [data, data2] = await Promise.all([
        fetchData(url, "", false),
        fetchData(url2, "", false),
      ]);

      setPaymentHistory(data);
      setFeedingbycollectorhistory(data2);

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

  const fetchFeeStats = async (date = today) => {
    // setIsLoading(true);
    try {
      const [feeStatsData, dayStatsData] = await Promise.all([
        fetchData("/api/statistics/financialdata", "", false),
        fetchData(
          `/api/feedingNtransport/getoverallstats?date=${date}`,
          "",
          false
        ),
      ]);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch fee statistics");
      // }
      // const feeStatsData = await response.json();
      setFeeStats(dayStatsData);
      setExpenseStats(dayStatsData?.weeklyExpensesData);
      // console.log(dayStatsData)
    } catch (err) {
      console.error("Error fetching fee statistics:", err);
      toast.error("Failed to fetch fee statistics");
    } finally {
      // setIsLoading(false);
    }
  };

  function extractProcurementData(items) {
    if (items?.length > 0) {
      return items?.map((item) => ({
        class_id: item.class_id,
        class_name: item.class_name,
        payment_date: item.payment_date,
        total_class_feeding_fee: item.total_class_feeding_fee,
        total_class_transport_fee: item.total_class_transport_fee,
        total_class_amount: item.total_class_amount,
      }));
    } else return [];
  }
  const hisheaderNames = [
    "Class ID",
    "Class Name",
    "Payment Date",
    "Total Feeding",
    "Total Transport",
    "Total Amount",
  ];

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchFees(e.target.value);
  };

  const handleHistorySearchInputChange = (e) => {
    setSearchQuery1(e.target.value);
    fetchPaymentHistory(e.target.value, activeSemester);
  };

  const handlePickupSearchInputChange = (e) => {
    setPickUpSearchQuery(e.target.value);
    fetchPickupPoints(e.target.value);
  };

  const handleAddPickupPoint = async (class_id) => {
    try {
      setModalContent(
        <Addeditpickup
          setShowModal={setShowModal}
          // classesData={classesData}
          onCancel={() => {
            setShowModal(false);
            fetchPickupPoints();
            fetchPaymentHistory("", activeSemester);
            // fetchExpenseHistory();
            fetchFeeStats();
          }}
        />
      );
    } catch (error) {
      console.log(error);
    } finally {
      setShowModal(true);
    }
    setShowModal(true);
  };

  const handleEditPickupPoint = async (class_id) => {
    try {
      const [pickUpPointData] = await Promise.all([
        fetchData(
          `/api/feedingNtransport/pickup/get?id=${class_id}`,
          "staff",
          true
        ),
      ]);
      console.log("pickUpPointData", pickUpPointData);
      setModalContent(
        <Addeditpickup
          setShowModal={setShowModal}
          id={class_id}
          pickUpPointData={pickUpPointData}
          onCancel={() => {
            setShowModal(false);
            fetchPickupPoints();
            fetchPaymentHistory("", activeSemester);
            // fetchExpenseHistory();
            fetchFeeStats();
          }}
        />
      );
    } catch (error) {
      console.log(error);
    } finally {
      setShowModal(true);
    }
    setShowModal(true);
  };

  const handleDeletePickup = async (pick_up_id) => {
    if (
      !(
        session?.user?.role === "admin" ||
        session?.user?.permissions?.some(
          (permission) => permission === "delete pick up point" // You might want to change this permission name
        )
      )
    ) {
      return (
        <div className="flex items-center">
          You are not authorized to delete pick-up points
        </div>
      );
    }

    try {
      setModalContent(
        <div>
          <DeleteUser
            userData={pick_up_id}
            onClose={() => setShowModal(false)}
            onDelete={async () => {
              const toastId = toast.loading("Processing your request...");

              try {
                const response = await fetch(
                  `/api/feedingNtransport/pickup/delete/${pick_up_id}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      user_id: session.user.user_id, // Send current user ID for audit
                    }),
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  // Handle associated students error specifically
                  if (response.status === 409) {
                    toast.update(toastId, {
                      render: (
                        <div>
                          <p>{data.error}</p>
                          <p>
                            Associated students:{" "}
                            {data.associatedStudents.join(", ")}
                          </p>
                        </div>
                      ),
                      type: "error",
                      isLoading: false,
                      autoClose: 5000,
                    });
                    return;
                  }

                  throw new Error(
                    data.error || "Failed to delete pick-up point"
                  );
                }

                // Refresh pick-up points list after deletion
                await fetchPickupPoints(); // Update this to your actual data refresh function

                toast.update(toastId, {
                  render: "Pick-up point deleted successfully",
                  type: "success",
                  isLoading: false,
                  autoClose: 2000,
                });
                setShowModal(false);
              } catch (error) {
                console.error("Deletion error:", error);
                toast.update(toastId, {
                  render:
                    error.message || "An error occurred. Please try again.",
                  type: "error",
                  isLoading: false,
                  autoClose: 3000,
                });
              }
            }}
          />
        </div>
      );
    } catch (error) {
      console.error("Modal setup error:", error);
    } finally {
      setShowModal(true);
    }
  };

  const handleAddFee = async (class_id) => {
    try {
      setModalContent(
        <FeeCollectionPage
          setShowModal={setShowModal}
          classesData={classesData}
          onCancel={() => {
            setShowModal(false);
            fetchFees();
            fetchPaymentHistory("", activeSemester);
            // fetchExpenseHistory();
            fetchFeeStats();
          }}
          classId={class_id}
          // readonly={true}
        />
      );
    } catch (error) {
      console.log(error);
    } finally {
      setShowModal(true);
    }
    setShowModal(true);
  };

  const handleEditFeeding = async (class_id, date, readOnly = false) => {
    try {
      setModalContent(
        <FeeCollectionPage
          setShowModal={setShowModal}
          classesData={classesData}
          onCancel={() => {
            setShowModal(false);
            fetchFees();
            fetchPaymentHistory("", activeSemester);
            // fetchExpenseHistory();
            fetchFeeStats();
          }}
          classId={class_id}
          useDate={date}
          readonly={readOnly}
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
    const expense = feedingbycollectorhistory.find(
      (expense) => expense.id === expense_id
    );

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
              // fetchExpenseHistory();
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
              // fetchExpenseHistory();
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

  const extractFeeData = (data) => {
    // console.log('extractFeeData', data);
    if (data?.length > 0) {
      return data.map((item) => ({
        id: item.class_id,
        student_name: item.full_name,
        class_name: item.class_name,
        feeding_fee: item.feeding_fee,
        transport_fee: item.transport_fee,
        total_fees_due: item.total_fees_due,
      }));
    }
  };

  const headerNames = [
    "Class ID",
    "Student Name",
    "Class",
    "Feeding(GHC)",
    "T & T(GHC)",
    "Total Per Day(GHC)",
    // "Status",
  ];

  const extractPaymentHistoryData = (items) => {
    if (items?.length > 0) {
      return items?.map((item) => ({
        collected_by: item.collected_by,
        staff_name: item.staff_name,
        payment_date: item.payment_date,
        students_paid: item.students_paid,
        classes_collected: item.classes_collected,
        total_feeding_collected: item.total_feeding_collected,
        total_transport_collected: item.total_transport_collected,
        total_amount_collected: item.total_amount_collected,
      }));
    }
  };

  const historyheaderNames = [
    "Staff ID",
    "Staff Name",
    "Payment Date",
    "Students Paid",
    "No. of Class",
    "Total Feeding",
    "Total Transport",
    "Total Amount",
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
        You are not authorised "view feeding fee and tnt" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Feeding And Transport Fee Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaMoneyBillWave />}
            title="No. of Feeding Payers"
            value={
              feeStats?.school_statistics?.daily_statistics
                ?.students_paid_feeding || 0
            }
          />
          <StatCard
            icon={<FaUserGraduate />}
            title="Total Day's Feeding"
            value={
              feeStats?.school_statistics?.daily_statistics?.total_feeding_received?.toFixed(
                2
              ) || 0
            }
          />
          <StatCard
            icon={<FaMoneyBillWave />}
            title="Total Day's Expectation"
            value={
              feeStats?.school_statistics?.expected_statistics?.total_feeding_expected?.toFixed(
                2
              ) || 0
            }
          />
          <StatCard
            icon={<FaCalendarAlt />}
            title="Total Week's Feeding"
            value={
              feeStats?.school_statistics?.weekly_statistics?.total_feeding_received?.toFixed(
                2
              ) || 0
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaMoneyBillWave />}
            title="No. of T&T Payers"
            value={
              feeStats?.school_statistics?.daily_statistics
                ?.students_paid_transport || 0
            }
          />
          <StatCard
            icon={<FaUserGraduate />}
            title="Total Day's T&T"
            value={
              feeStats?.school_statistics?.daily_statistics?.total_transport_received?.toFixed(
                2
              ) || 0
            }
          />
          <StatCard
            icon={<FaMoneyBillWave />}
            title="Total Day's Expectation"
            value={
              feeStats?.school_statistics?.expected_statistics?.total_transport_expected?.toFixed(
                2
              ) || 0
            }
          />
          <StatCard
            icon={<FaCalendarAlt />}
            title="Total Week's T&T"
            value={
              feeStats?.school_statistics?.weekly_statistics?.total_transport_received?.toFixed(
                2
              ) || 0
            }
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Feeding Fee and Transport Records
            </h2>

            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "take feeding and tnt"
              )) && (
              <button
                onClick={handleAddFee}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Take Feeding & TnT Fee
              </button>
            )}
          </div>
          <div className="overflow-x-auto tableWrap">
            {isLoading ? (
              <LoadingPage />
            ) : (
              <CustomTable
                data={extractFeeData(fees)}
                headerNames={headerNames}
                maxTableHeight="50vh"
                height="40vh"
                handleEdit={handleAddFee}
                handleEvaluation={handleFeeHistoryById}
                handleSearch={handleSearchInputChange}
                searchTerm={searchQuery}
                editIcon={<FaMoneyBillWave />}
                editTitle="Receive Payment for class "
                searchPlaceholder="Search by student name or class name"
                displayDetailsBtn={false}
                displayDelBtn={false}
                displayEvaluationBtn={false}
                evalTitle="View payment history for "
                evaluationIcon={<FaClipboardList />}
                displayActions={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "take feeding and tnt"
                  )
                }
              />
            )}
          </div>
          {/* <div className="pt-2 text-red-500">
            *All negative(-) values are amount owed by the pupil.{" "}
            <p className="text-green-600">*Positive values are carry forwards</p>
          </div> */}
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Payment history By Class
            </h2>

            {/* <button
              onClick={handleAddExpense}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Record Expense
            </button> */}
          </div>
          <div className="tableWrap height-45vh">
            {extractProcurementData(paymentHistory)?.length > 0 ? (
              <table className={`overflow-y-scroll uppercase table-auto`}>
                <thead className="header-overlay ">
                  <tr className=" px-6 py-3 text-xs font-medium text-white text-center uppercase tracking-wider">
                    {hisheaderNames?.map((header, index) => (
                      <th
                        key={index}
                        title={header}
                        className="bg-cyan-700 p-4"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="text-left pl-4 bg-cyan-700">Actions</th>
                  </tr>
                </thead>
                <tbody
                  className={`bg-white divide-y divide-gray-200 text-cyan-800  overflow-scroll `}
                >
                  {extractProcurementData(paymentHistory)?.map(
                    (item, index) => {
                      return (
                        <>
                          <tr
                            key={index}
                            // title={item}
                            className={`${
                              index % 2 === 0 ? "bg-gray-100" : ""
                            }  hover:bg-cyan-50 text-center`}
                          >
                            {Object.values(item).map((value, colIndex) => {
                              // console.log("value", item);
                              return (
                                <td
                                  key={colIndex}
                                  title={value}
                                  className={`border px-6 py-4 whitespace-nowrap`}
                                >
                                  {typeof value === "object" &&
                                  value !== null ? (
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 relative">
                                        <Image
                                          src={
                                            value.src ||
                                            value.image_details ||
                                            "/default-image.jpg"
                                          }
                                          alt=""
                                          layout="fill"
                                          objectFit="cover"
                                          className="rounded-full"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    value?.toString() || ""
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-6 py-4 whitespace-nowrap text-lg font-medium flex text-right">
                              {/* {isDeleteAuthorised && ( */}
                              {item.payment_date === today && (
                                <button
                                  onClick={() =>
                                    handleEditFeeding(
                                      item.class_id,
                                      item.payment_date,
                                      false
                                    )
                                  }
                                  className="mr-6 text-xl grid text-cyan-900 hover:text-cyan-500 hover:bg-white"
                                  title={`Edit feeding and transport made on ${item.payment_date} by ${item.class_name}`}
                                >
                                  <FaEdit />
                                </button>
                              )}
                              {/* // )} */}
                              <button
                                onClick={() =>
                                  handleEditFeeding(
                                    item.class_id,
                                    item.payment_date,
                                    true
                                  )
                                }
                                className="mr-6 text-xl grid text-cyan-900 hover:text-cyan-500 hover:bg-white"
                                title={`View the details of items feeding and transport by ${item.class_name} on ${item.payment_date} `}
                              >
                                <FaInfoCircle />
                              </button>
                              {/* 
                            <button
                              onClick={() => handleEvaluation(item.id)}
                              className="mr-6 text-xl grid text-green-500 hover:text-green-900 hover:bg-white"
                              // title={`${evalTitle} ${item.id}`}
                            >
                              <FaListAlt />
                            </button> */}
                            </td>
                          </tr>
                          {/* <tr key="print-row" className="bg-gray-100 text-right"></tr> */}
                        </>
                      );
                    }
                  )}
                </tbody>
              </table>
            ) : (
              <div className="text-cyan-700">No data found</div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Payment History By Collector
            </h2>
          </div>

          <div className="overflow-x-auto tableWrap">
            {isLoading ? (
              <LoadingPage />
            ) : (
              <CustomTable
                data={extractPaymentHistoryData(feedingbycollectorhistory)}
                headerNames={historyheaderNames}
                maxTableHeight="40vh"
                height="20vh"
                handleSearch={handleHistorySearchInputChange}
                handleEdit={handlePrintFee}
                searchTerm={searchQuery1}
                editTitle="Print receipt for fees with id: "
                searchPlaceholder="Search by student name, or class name"
                displayDetailsBtn={false}
                displayDelBtn={false}
                displayActions={false}
                editIcon={<FaPrint />}
              />
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Pickup Points
            </h2>

            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "add pick up point"
              )) && (
              <button
                onClick={handleAddPickupPoint}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Pick-Up Point
              </button>
            )}
          </div>
          <div className="overflow-x-auto tableWrap">
            {isLoading ? (
              <LoadingPage />
            ) : (
              <CustomTable
                data={pickUpPoints}
                headerNames={["ID", "Pick Up Point", "Pick Up Price"]}
                maxTableHeight="50vh"
                height="40vh"
                handleEdit={handleEditPickupPoint}
                handleEvaluation={handleFeeHistoryById}
                handleSearch={handlePickupSearchInputChange}
                handleDelete={handleDeletePickup}
                searchTerm={pickUpSearchQuery}
                // editIcon={<FaMoneyBillWave />}
                editTitle="Edit pick up details for  "
                searchPlaceholder="Search by pickup point"
                displayDetailsBtn={false}
                displayEvaluationBtn={false}
                evalTitle="View payment history for "
                evaluationIcon={<FaClipboardList />}
                displayActions={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "view feeding fee and tnt"
                  )
                }
                displayDelBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.permissions?.some(
                    (permission) => permission === "edit collected fees"
                  )
                }
              />
            )}
          </div>
          {/* <div className="pt-2 text-red-500">
            *All negative(-) values are amount owed by the pupil.{" "}
            <p className="text-green-600">*Positive values are carry forwards</p>
          </div> */}
        </div>
      </div>
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            fetchFees();
            fetchPaymentHistory("", activeSemester);
            // fetchExpenseHistory();
            fetchFeeStats();
          }}
        >
          {modalContent}
        </Modal>
      )}

      {showReceipt && (
        <ReceiptGenerator
          receiptData={receiptData}
          onClose={() => {
            setShowReceipt(false);
            // onCancel();
          }}
        />
      )}
    </>
  );
};

export default FeedingFeesManagement;
