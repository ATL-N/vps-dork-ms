"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fetchData } from "../../../config/configFile";
import { getTodayString } from "../../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
  "#ff7c43",
  "#665191",
];

const FinancialReports = () => {
  const { data: session, status } = useSession();

  const [reportData, setReportData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [expenseDistribution, setExpenseDistribution] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session?.user?.activeSemester?.semester_id;
      // setSender_id(session?.user?.id);
      console.log("session?.user?.id", session?.user?.id);
      // setActiveSem(activeSemester);
      // fetchFinancialStats(activeSemester);
      setIsLoading(false);
    }

    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view financial report"];

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

  const fetchReportData = async (start, end) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchData(
        `/api/finance/getreport?startDate=${start}&endDate=${end}`
      );
      setReportData(data?.monthlyData);
      setPieChartData(data?.revenueDistribution);
      setExpenseDistribution(data?.expenseDistribution);
    } catch (err) {
      setError("Failed to fetch report data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    const filteredData = reportData;
    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.revenue),
      0
    );
    const totalExpenses = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.expenses),
      0
    );
    const totalProfit = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.profit),
      0
    );

    const summary = `
      Financial Report Summary (${new Date(
        startDate
      ).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()})
      
      Total Revenue: GHC ${totalRevenue.toLocaleString()}
      Total Expenses: GHC ${totalExpenses.toLocaleString()}
      Total Profit: GHC ${totalProfit.toLocaleString()}
      
      Performance Analysis:
      ${
        totalProfit > 0
          ? `• Positive financial performance with a profit margin of ${(
              (totalProfit / totalRevenue) *
              100
            ).toFixed(1)}%`
          : `• Financial challenges observed with a negative profit margin of ${(
              (totalProfit / totalRevenue) *
              100
            ).toFixed(1)}%`
      }
      
      ${
        filteredData.length > 1
          ? `• Revenue ranged from GHC ${Math.min(
              ...filteredData.map((item) => item.revenue)
            ).toLocaleString()} to GHC ${Math.max(
              ...filteredData.map((item) => item.revenue)
            ).toLocaleString()}
          • Average monthly revenue: GHC ${(
            totalRevenue / filteredData.length
          ).toLocaleString()}`
          : ""
      }
    `;

    const report = {
      title: "Financial Report",
      startDate: new Date(startDate).toLocaleDateString(),
      endDate: new Date(endDate).toLocaleDateString(),
      financialData: filteredData,
      revenueDistribution: pieChartData,
      expenseDistribution: expenseDistribution,
      summary: summary.trim(),
    };

    setGeneratedReport(report);
  };

  const handleDateSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    await fetchReportData(startDate, endDate);
  };

  const printReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    const addCenteredText = (text, y, size = 16) => {
      doc.setFontSize(size);
      const textWidth =
        (doc.getStringUnitWidth(text) * size) / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    const addWrappedText = (text, x, y, maxWidth) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length;
    };

    // Add header
    doc.setFont("helvetica", "bold");
    addCenteredText("Financial Report", 20);

    // Add period
    doc.setFontSize(12);
    addCenteredText(
      `Period: ${generatedReport.startDate} to ${generatedReport.endDate}`,
      30
    );

    // Add summary section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Summary", 20, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const summaryLines = addWrappedText(
      generatedReport.summary,
      20,
      55,
      pageWidth - 40
    );

    // Add financial data table
    let yPos = 60 + summaryLines * 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Financial Data", 20, yPos);

    const tableData = generatedReport.financialData.map((item) => [
      new Date(item.month).toLocaleDateString(),
      `GHC ${item.revenue.toLocaleString()}`,
      `GHC ${item.expenses.toLocaleString()}`,
      `GHC ${item.profit.toLocaleString()}`,
    ]);

    doc.autoTable({
      startY: yPos + 5,
      head: [["Month", "Revenue", "Expenses", "Profit"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [0, 150, 150] },
      margin: { left: 20, right: 20 },
    });

    // Add revenue distribution
    let currentY = doc.autoTable.previous.finalY + 15;

    if (currentY > doc.internal.pageSize.height - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Revenue Distribution", 20, currentY);

    const revenueData = generatedReport.revenueDistribution.map((item) => [
      item.name,
      `${item.value}%`,
    ]);

    doc.autoTable({
      startY: currentY + 5,
      head: [["Category", "Percentage"]],
      body: revenueData,
      theme: "grid",
      headStyles: { fillColor: [0, 150, 150] },
      margin: { left: 20, right: 20 },
    });

    // Add expense distribution
    currentY = doc.autoTable.previous.finalY + 15;

    if (currentY > doc.internal.pageSize.height - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Expense Distribution", 20, currentY);

    const expenseData = generatedReport.expenseDistribution.map((item) => [
      item.name,
      `${item.value}%`,
    ]);

    doc.autoTable({
      startY: currentY + 5,
      head: [["Category", "Percentage"]],
      body: expenseData,
      theme: "grid",
      headStyles: { fillColor: [0, 150, 150] },
      margin: { left: 20, right: 20 },
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        20,
        doc.internal.pageSize.height - 10
      );
    }

    const fileName = `financial_report_${startDate}_${endDate}.pdf`;
    doc.save(fileName);
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
      <div className="flex items-center text-cyan-600">
        You are not authorised "view financial report" to be on this page
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg max-w-7xl mx-auto mb-10">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        Financial Reports
      </h2>

      <form onSubmit={handleDateSubmit} className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200"
              max={getTodayString()}
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200"
              min={startDate}
              max={getTodayString()}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {isLoading ? "Loading..." : "Fetch Data"}
          </button>
        </div>
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </form>

      {reportData?.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="shadow mb-6 p-3">
              <h3 className="text-lg font-semibold mb-2 text-cyan-700">
                Financial Overview
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                  <Bar dataKey="profit" fill="#ffc658" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="shadow p-3">
              <h3 className="text-lg font-semibold mb-2 text-cyan-700">
                Revenue Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {pieChartData.map((entry, index) => (
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

            <div className="shadow p-3">
              <h3 className="text-lg font-semibold mb-2 text-cyan-700">
                Expense Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {expenseDistribution.map((entry, index) => (
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
          </div>
        </>
      )}

      {reportData?.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              generateReport();
              setShowModal(true);
            }}
            disabled={reportData?.length === 0}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Report
          </button>
        </div>
      )}

      {showModal && generatedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{generatedReport.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <p className="mb-4">
              Period: {generatedReport.startDate} to {generatedReport.endDate}
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Financial Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full mb-4 border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2">Month</th>
                      <th className="border p-2">Revenue</th>
                      <th className="border p-2">Expenses</th>
                      <th className="border p-2">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.financialData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2">
                          {new Date(item.month).toLocaleDateString()}
                        </td>
                        <td className="border p-2">
                          GHC {item.revenue.toLocaleString()}
                        </td>
                        <td className="border p-2">
                          GHC {item.expenses.toLocaleString()}
                        </td>
                        <td className="border p-2">
                          GHC {item.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Summary</h3>
              <p className="whitespace-pre-line">{generatedReport.summary}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Revenue Distribution
              </h3>
              <ul className="list-disc pl-5">
                {generatedReport.revenueDistribution.map((item, index) => (
                  <li key={index} className="mb-1">
                    {item.name}: {item.value}%
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Expense Distribution
              </h3>
              <ul className="list-disc pl-5">
                {generatedReport.expenseDistribution.map((item, index) => (
                  <li key={index} className="mb-1">
                    {item.name}: {item.value}%
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={printReport}
                className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
