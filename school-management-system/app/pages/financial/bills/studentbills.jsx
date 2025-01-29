"use client";
import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaFileInvoice,
  FaSchool,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SecondModal from "../../../components/modal";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";

const printInvoice = async (invoiceData, doc) => {
  const {
    invoiceNumber,
    class: className,
    semester,
    invoiceItems,
    totalAmount,
    dateIssued,
    studentName,
    studentId,
  } = invoiceData;

  const institutionName = process.env.NEXT_PUBLIC_SCHOOL_NAME;
  const institutionEmail = process.env.NEXT_PUBLIC_SCHOOL_EMAIL;
  const institutionPhone = process.env.NEXT_PUBLIC_SCHOOL_PHONE;
  const schoolMotto = process.env.NEXT_PUBLIC_SCHOOL_MOTTO;

  // Set font
  doc.setFont("helvetica");

  // Colors
  const primaryColor = "#000000FF";
  const secondaryColor = "#777777";

  // Institution details
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.text(institutionName?.toUpperCase(), 10, 10);
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(institutionEmail?.toLowerCase(), 10, 17);
  doc.text(institutionPhone?.toUpperCase(), 10, 23);
  doc.text(schoolMotto, 10, 28);

  // Logo
  const logoUrl = "/favicon.ico";
  const logoSize = 15;
  const img = new Image();
  img.src = logoUrl;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      doc.addImage(img, "PNG", 190, 10, logoSize, logoSize);
      // Invoice title
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text("BILL".toUpperCase(), 105, 25, { align: "center" });

      // Subtle separator line
      doc.setDrawColor(secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(10, 32, 200, 32);

      // Invoice details
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      // doc.text(`Invoice Number: ${invoiceNumber}`, 10, 40);
      doc.text(`Date Issued: ${dateIssued?.toUpperCase()}`, 10, 46);
      doc.text(`Class: ${className?.toUpperCase()}`, 10, 52);
      doc.text(`Semester: ${semester?.toUpperCase()}`, 10, 58);

      // Bill To section
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text("Bill To:".toUpperCase(), 120, 40);
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text(`Student Name: ${studentName?.toUpperCase()}`, 120, 46);
      doc.text(`Student ID: ${String(studentId).toUpperCase()}`, 120, 52);

      // Invoice items table
      const tableColumn = ["Description", "Amount (GHC)"];
      const tableRows = invoiceItems?.map((item) => [
        item.description?.toUpperCase(),
        item.amount?.toFixed(2),
      ]);

      doc.autoTable({
        startY: 65,
        head: [tableColumn],
        body: tableRows,
        theme: "plain",
        headStyles: {
          fillColor: "#f3f3f3",
          textColor: primaryColor,
          fontStyle: "bold",
          halign: ["left", "right"],
        },
        columnStyles: {
          0: { halign: "left" }, // Align the first column header left
          1: { halign: "right" }, // Align the second column header right
        },
        styles: { fontSize: 9 },
      });

      // Total amount
      const finalY = doc.lastAutoTable.finalY || 65;
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text("Total:".toUpperCase(), 120, finalY + 8);
      doc.setFontSize(13);
      doc.text(`GHC ${totalAmount?.toFixed(2)}`, 170, finalY + 8, {
        align: "left",
      });

      // Footer
      doc.setTextColor(secondaryColor);
      doc.setFontSize(8);
      const footerText =
        "Please pay the fees on time. For queries, contact the school administration.";
      doc.text(footerText.toUpperCase(), 105, 135, {
        align: "center",
        maxWidth: 180,
      });

      // Subtle bottom line
      doc.setDrawColor(secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(10, 140, 200, 140);
      resolve(doc);
    };
    img.onerror = () => {
      console.error("Error loading the logo image");
      reject(new Error("Error loading logo image"));
    };
  });
};

const StudentBills = ({ class_id, semester_id, onClose }) => {
  const { data: session, status } = useSession();

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportPreview, setReportPreview] = useState(null);
  const [selectedClass, setSelectedClass] = useState(class_id || "");
  const [selectedSemester, setSelectedSemester] = useState(semester_id || "");
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [classes, setClasses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState(null);
  const [activeSem, setActiveSem] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [classesData, setClassesData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);

  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME;
  const schoolEmail = process.env.NEXT_PUBLIC_SCHOOL_EMAIL;
  const schoolPhone = process.env.NEXT_PUBLIC_SCHOOL_PHONE;

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session.user.activeSemester.semester_id;
      setActiveSem(activeSemester);
      // if(selectedClass & selectedSemester){

      //   fetchClassAcademicReports(class_id, activeSemester);
      // }
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    fetchallData();

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
  }, [session, status]);

  useEffect(() => {
    if (class_id && semester_id) {
      fetchClassAcademicReports(class_id, semester_id);
    } else if (selectedClass && selectedSemester) {
      fetchClassAcademicReports(selectedClass, selectedSemester);
    }
  }, [selectedClass, selectedSemester]);

  useEffect(() => {
    setSelectAll(selectedStudents?.length === students?.length);
  }, [selectedStudents, students]);

  const fetchClassAcademicReports = async (class_id, semester_id) => {
    setLoading(true);
    try {
      const data = await fetchData(
        `/api/finance/viewstudentssembills/${class_id}/${semester_id}`,
        "",
        false
      );
      if (data && Object.keys(data).length > 0) {
        console.log("analytics222", data?.totalStudents);

        // setAnalytics(data?.gradeAnalytics);
        setStudents(data);
        // setTotalStudents(data?.totalStudents);
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        // setError("No data available for this semester.");
      }
    } catch (err) {
      // setError("Failed to fetch analytics data. Please try again later.");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const fetchallData = async () => {
    setIsLoading(true);
    try {
      const [classes, semesterdata] = await Promise.all([
        fetchData("/api/classes/all", "class", false),
        fetchData("/api/semester/all", "semester", false),
      ]);
      setClassesData(classes?.classes);
      setSemesterData(semesterdata);
      console.log("semesterData", classes, semesterData);
      // setSelectedSemester(semesterdata[0].semester_id);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedStudents(students?.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleGenerateBills = () => {
    const reportData = students?.filter((student) =>
      selectedStudents.includes(student.id)
    );
    setReportPreview(reportData);
    setIsModalOpen(true);
  };

  const handlePrint = async () => {
    if (!reportPreview || reportPreview.length === 0) {
      return;
    }
    const doc = new jsPDF({
      format: "a5",
      orientation: "landscape",
      unit: "mm",
    });

    for (const bill of reportPreview) {
      const formattedDate = new Date().toISOString().split("T")[0];
      const invoiceData = {
        invoiceNumber: "INV-" + Math.random().toString(36).substring(2, 15),
        class: bill.class,
        semester: bill.semester,
        invoiceItems: bill.invoiceItems,
        totalAmount: bill.totalAmountOwed,
        dateIssued: formattedDate,
        studentName: `${bill.firstName} ${bill.lastName}`,
        studentId: bill.id,
      };
      await printInvoice(invoiceData, doc);
      if (reportPreview.indexOf(bill) < reportPreview.length - 1) {
        doc.addPage();
      }
    }

    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
    setIsModalOpen(false);
  };

  const BillPreview = ({ bill }) => (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-8">
      <div className="bg-cyan-700 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FaFileInvoice className="mr-2" /> Bill
        </h1>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2">Date Issued:</p>
            <p>{new Date().toISOString().split("T")[0]}</p>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaSchool className="mr-2" /> Class:
            </p>
            <p>{bill.class}</p>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaCalendarAlt className="mr-2" /> Semester:
            </p>
            <p>{bill.semester}</p>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2">Student Name:</p>
            <p>
              {bill.firstName} {bill.lastName}
            </p>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="bg-cyan-100">
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2">Amount (GHC)</th>
            </tr>
          </thead>
          <tbody>
            {bill.invoiceItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 uppercase">{item.description}</td>
                <td className="text-right p-2 uppercase">
                  {item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-gray-700 font-bold mb-2 flex items-center justify-end">
              <FaMoneyBillWave className="mr-2" /> Total Amount:
            </p>
            <p className="text-2xl text-cyan-700 font-bold">
              GHC {bill.totalAmountOwed.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        Please do your best to pay the fees on time. For any queries, please
        contact the school administration.
      </div>
    </div>
  );
  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>error</div>;
  }

  if (!students) {
    return (
      <div>
        {" "}
        There is no students? Report data available for the class and current
        semester.
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised to be on this page...!
      </div>
    );
  }

  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">Class Bills</h2>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form className="mb-4 flex space-x-4 w-full">
          <div className="mb-4 flex space-x-4 w-full">
            {class_id ? (
              <div className="border-2 border-cyan-300 rounded-md p-2 w-[50%]">
                {classesData
                  ?.filter((cls) => cls.class_id === class_id)
                  .map((cls) => cls.class_name || "No class selected")}
              </div>
            ) : (
              <select
                className="border-2 border-cyan-300 rounded-md p-2 w-[50%]"
                value={selectedClass}
                onChange={handleClassChange}
                required
              >
                <option value="">Select Class</option>
                {classesData?.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            )}
            {semester_id ? (
              <div className="border-2 border-cyan-300 rounded-md p-2 w-full">
                {semesterData
                  ?.filter((sem) => sem.id === semester_id)
                  .map((sem) => sem.semester_name) || "No semester selected"}
              </div>
            ) : (
              <div className="flex-1">
                <select
                  id="semester-select"
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a semester</option>
                  {semesterData.map((semester) => (
                    <option key={semester?.id} value={semester?.id}>
                      {`${semester?.semester_name} ${semester?.start_date}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </form>

        {selectedClass && selectedSemester && (
          <>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="form-checkbox h-5 w-5 text-cyan-600"
                      />
                    </th>
                    <th>Name</th>
                    {/* <th>Student Average</th> */}
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-cyan-600"
                          onChange={() => handleStudentSelection(student.id)}
                          checked={selectedStudents.includes(student.id)}
                        />
                      </td>
                      <td className="uppercase">
                        {student.lastName} {student.firstName}
                      </td>
                      {/* <td>{student?.average.toFixed(2)}</td> */}
                      <td>{student.totalAmountOwed.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        <div className="flex justify-between space-x-4 mt-4">
          <div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Close
            </button>
          </div>

          <div className="flex">
            <button
              onClick={handleGenerateBills}
              className={`px-4 py-2 mr-4 text-white rounded-md flex items-center ${
                selectedStudents.length === 0
                  ? "bg-gray-200 hover:bg-gray-200 focus:ring-gray"
                  : "bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              }`}
              disabled={selectedStudents.length === 0}
            >
              <FaFileAlt className="mr-2" />
              Generate Selected Bills
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <SecondModal onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Bill Preview
          </h3>
          <div className="mt-2 px-4 py-3 max-h-[70vh] overflow-y-auto">
            {reportPreview?.map((bill) => (
              <BillPreview key={bill.studentId} bill={bill} />
            ))}
          </div>
          <div className="flex justify-between space-x-4 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-600"
            >
              Print
            </button>
          </div>
        </SecondModal>
      )}
    </div>
  );
};

export default StudentBills;
