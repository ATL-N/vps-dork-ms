'use client'
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClipboardList } from "react-icons/fa";
import CustomTable from "../../../components/listtableForm";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";
import { useSession } from "next-auth/react";

const StudentPaymentHistory = ({ student_id, onClose }) => {
  const { data: session, status } = useSession();

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSemester, setActiveSemester] = useState();

  useEffect(() => {
    setIsLoading(true);

    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      setActiveSemester(session?.user?.activeSemester?.semester_id);
      fetchStudentInfo();
      fetchPaymentHistory();
      setIsLoading(false);
    }
  }, [status, session, student_id]);

  const fetchStudentInfo = async () => {
    try {
        setIsLoading(true)
      const url = `/api/students/${student_id}`;
      const data = await fetchData(url, "", false);
      setStudentInfo(data);
    } catch (err) {
      console.error("Error fetching student info:", err);
      toast.error(`Error fetching student information: ${err.message}`);
    }finally{
        setIsLoading(false)
    }
  };

  const fetchPaymentHistory = async (searchQuery = "") => {
    try {
      //   setIsLoading(true);
      setError(null);

      let url = `/api/fees/getpaymenthistory/${student_id}`;
      if (searchQuery.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery)}`;
      }

      const data = await fetchData(url, "", false);
      setPaymentHistory(data);

      if (searchQuery.trim() !== "" && data.length === 0) {
        setError("No payment history found matching your search.");
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      //   setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchPaymentHistory(e.target.value);
  };

  const extractPaymentHistoryData = (data) => {
    if (data?.length > 0) {
      return data.map((item) => ({
        id: item.collection_id,
        old_balance: `GHC ${-item.old_balance}`,
        new_balance: `GHC ${-item.new_balance}`,
        amount_received: `GHC ${item.amount_received}`,
        payment_date: item.payment_date,
        received_by: item?.staff_name,
      }));
    }
  };

  const headerNames = [
    "ID",
    "Old Balance(GHC)",
    "New Balance(GHC)",
    "Amount Received(GHC)",
    "Date",
    "Received By",
  ];

  if (status === "loading") {
    return <LoadingPage />;
  }

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        {studentInfo && `${studentInfo.first_name} ${studentInfo.last_name}'s`}{" "}
        Payment History
      </h1>
      {/* {studentInfo && (
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-700">
          <h2 className="text-2xl font-semibold mb-2">{`${studentInfo.first_name} ${studentInfo.last_name}`}</h2>
          <p className="text-lg">Current Class: {studentInfo.class_name}</p>
        </div>
      )} */}
      <div className="bg-white p-4 rounded shadow mb-6 text-cyan-500">
        {/* <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            Payment History
          </h2>
        </div> */}
        <div className="overflow-x-auto tableWrap">
          {isLoading ? (
            <LoadingPage />
          ) : (
            <CustomTable
              data={extractPaymentHistoryData(paymentHistory)}
              headerNames={headerNames}
              maxTableHeight="40vh"
              height="20vh"
              handleSearch={handleSearchInputChange}
              searchTerm={searchQuery}
              editIcon={<FaClipboardList />}
              editTitle="View payment details"
              searchPlaceholder="Search by recipient name"
              displayDetailsBtn={false}
              displayDelBtn={false}
              displayActions={false}
            />
          )}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StudentPaymentHistory;
