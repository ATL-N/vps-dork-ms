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

  const generatePDF = () => {
    const doc = new jsPDF({
      format: "a5",
      orientation: "landscape",
      unit: "mm",
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    reportPreview.forEach((report, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Header
      doc.setFontSize(14);
      doc.text(schoolName, pageWidth / 2, 8, {
        align: "center",
      });
      doc.setFontSize(10);
      doc.text(schoolEmail, pageWidth / 2, 13, { align: "center" });
      doc.setFontSize(10);
      doc.text(schoolPhone, pageWidth / 2, 18, { align: "center" });

      doc.setFontSize(12);
      doc.text("Student Report Card", pageWidth / 2, 23, { align: "center" });

      // Student Information (3 columns)
      doc.setFontSize(10);
      const columnWidth = pageWidth / 3;
      const startY = 29;
      const lineHeight = 5;

      // Column 1
      doc.text(`Name: ${report.name}`, 5, startY);
      doc.text(`Student ID: ${report.id}`, 5, startY + lineHeight);
      doc.text(`Class: ${report.className}`, 5, startY + 2 * lineHeight);

      // Column 2
      doc.text(`No. of Students: ${totalStudents}`, columnWidth + 5, startY);
      doc.text(
        `Overall Position: ${report.overallPosition}`,
        columnWidth + 5,
        startY + lineHeight
      );
      doc.text(
        `Total Marks: ${report.total}`,
        columnWidth + 5,
        startY + 2 * lineHeight
      );

      // Column 3
      doc.text(`Email: ${report.email}`, 2 * columnWidth + 5, startY);
      doc.text(
        `Average: ${report.average.toFixed(2)}`,
        2 * columnWidth + 5,
        startY + lineHeight
      );
      doc.text(
        `Attendance: ${report.attendance.studentAttendance}/${report.attendance.totalSemesterAttendance}`,
        2 * columnWidth + 5,
        startY + 2 * lineHeight
      );

      // Grades Table
      const tableStartY = startY + 3 * lineHeight;
      const tableColumn = [
        "Subject",
        "Class Score",
        "Exams Score",
        "Total Score",
        "Remark",
        "Position",
      ];
      const tableRows = Object.entries(report.grades).map(([subject, data]) => [
        subject,
        data.class_score,
        data.exams_score,
        data.grade,
        data.remark,
        data.position,
      ]);
      doc.autoTable({
        startY: tableStartY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [0, 150, 150], fontSize: 9 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 5, right: 5 },
        tableWidth: "auto",
      });

      const finalY = doc.previousAutoTable.finalY || 95;

      // Remarks
      doc.setFontSize(11);
      doc.text("Class Teacher's Remarks:", 5, finalY + 5);
      doc.setFontSize(10);
      doc.text(report.remarks.classTeacherRemark || " ", 5, finalY + 9, {
        maxWidth: pageWidth - 10,
      });

      doc.setFontSize(11);
      doc.text("Head Teacher's Remarks:", 5, finalY + 20);
      doc.setFontSize(10);
      doc.text(report.remarks.headTeacherRemark || " ", 5, finalY + 23, {
        maxWidth: pageWidth - 10,
      });

      // Footer
      doc.setFontSize(8);
      doc.text(
        "This is an official report card.",
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    });
    return doc;
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

  const handlePrint = () => {
    const printContent = reportPreview
      .map(
        (bill) => `
    <div class="bill-container">
      <div class="header">
        <img src="/favicon.ico" alt="School Logo" class="logo">
        <div class="school-info">
          <h1>${schoolName}</h1>
          <p>${schoolEmail}</p>
           <p>${schoolPhone}</p>
        </div>
        <h2>Bill</h2>
      </div>

      <div class="content">
        <div class="info-grid">
          <div class="info-item">
            <p class="label">Date Issued:</p>
            <p>${new Date().toISOString().split("T")[0]}</p>
          </div>
          <div class="info-item">
            <p class="label">Class:</p>
            <p>${bill.class}</p>
          </div>
          <div class="info-item">
            <p class="label">Semester:</p>
            <p>${bill.semester}</p>
          </div>
          <div class="info-item">
            <p class="label">Student Name:</p>
            <p>${bill.firstName
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ")} ${bill.lastName
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (GHC)</th>
            </tr>
          </thead>
          <tbody>
            ${bill.invoiceItems
              .map(
                (item) => `
              <tr>
                <td>${item.description.toUpperCase()}</td>
                <td>${item.amount.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total">
          <p class="label">Total Amount:</p>
          <p class="amount">GHC ${bill.totalAmountOwed.toFixed(2)}</p>
        </div>
      </div>

      <div class="footer">
      <p>All negative values are carry forward values. ie. The School is owing you that amount. </p>
        <p>Please do your best to pay the fees on time. For any queries, please contact the school administration.</p>
      </div>
    </div>
  `
      )
      .join("");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print Bills</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <style>
          @page {
            size: A5 portrait;
            margin: 0;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .bill-container {
            width: 148mm;
            height: 210mm;
            padding: 10mm;
            box-sizing: border-box;
            page-break-after: always;
          }
          .header {
            background-color: #0e7490;
            color: white;
            padding: 10px;
            text-align: center;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          .logo {
            width: 40px;
            height: 40px;
            margin-right: 10px;
          }
          .school-info {
            flex-grow: 1;
            text-align: left;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
          }
          .header h2 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
          }
          .content {
            padding: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .info-item {
            margin-bottom: 5px;
          }
          .label {
            font-weight: bold;
            color: #4b5563;
            margin-bottom: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 5px;
            text-align: left;
          }
          th {
            background-color: #e5e7eb;
          }
          .total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            font-weight: bold;
          }
          .total .amount {
            font-size: 18px;
            color: #0e7490;
          }
          .footer {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #4b5563;
            position: absolute;
            bottom: 10mm;
            left: 10mm;
            right: 10mm;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
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
            {reportPreview.map((bill) => (
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
