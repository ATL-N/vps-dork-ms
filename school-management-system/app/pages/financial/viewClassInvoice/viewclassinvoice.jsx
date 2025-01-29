"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";
import InvoiceDisplayPage from "../../../components/financialcomponent/invoiceDisplayPage";
import { fetchData } from "../../../config/configFile";
import printInvoice from "../printInvoice/printinvoice";

const ViewInvoice = ({ classData, semesterData }) => {
  const { data: session, status } = useSession();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["view bills"];

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

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setInvoiceData(null);
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setSelectedSemesterId(semesterId);
    setInvoiceData(null);
  };

  const fetchInvoiceData = async () => {
    setIsLoading(true);
    console.log(
      "selected class and semester",
      selectedClassId,
      selectedSemesterId
    );
    try {
      const data = await fetchData(
        `/api/finance/viewinvoice/${selectedClassId}/${selectedSemesterId}`
      );
      setInvoiceData(data);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      toast.error(
        "Failed to fetch invoice data or there is no data for the class and semester selected"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedSemesterId) {
      fetchInvoiceData();
    }
  }, [selectedClassId, selectedSemesterId]);

  const handlePrint = () => {
    printInvoice(invoiceData);
  };

if (isLoading) {
  return <Loadingpage />;
}

  if (!isAuthorised) {
    return (
      <div className="flex items-center justify-center h-full">
        You are not authorised to view this page...!
      </div>
    );
  }

  

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-700">View Fees(Bill)</h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label
            htmlFor="class-select"
            className="block text-sm font-medium text-cyan-700"
          >
            Select Class
          </label>
          <select
            id="class-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={selectedClassId}
            onChange={handleClassChange}
          >
            <option value="">Select a class</option>
            {classData?.map((class_) => (
              <option key={class_.class_id} value={class_.class_id}>
                {class_.class_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="semester-select"
            className="block text-sm font-medium text-cyan-700"
          >
            Select Semester
          </label>
          <select
            id="semester-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={selectedSemesterId || semesterData[0][0]}
            onChange={handleSemesterChange}
          >
            <option value="">Select a semester</option>
            {semesterData?.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.semester_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {invoiceData ? (
        <InvoiceDisplayPage
          invoiceData={invoiceData}
          handlePrint={handlePrint}
        />
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Select a class and semester to view the bill
        </div>
      )}
    </div>
  );
};

export default ViewInvoice;
