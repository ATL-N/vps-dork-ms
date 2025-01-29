// pages/dashboard/financial-management/financial-reports.js
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
import Modal from "../modal/modal";
import { FaPrint, FaFileExport } from "react-icons/fa";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const FinancialReports = ({reportdata=[], pieChartdata=[]}) => {
  const [reportData, setReportData] = useState(reportdata);
  const [pieChartData, setPieChartData] = useState(pieChartdata);
  const [showModal, setShowModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    // console.log('report data', reportData, pieChartData)
    if (reportdata.length<1){
      fetchReportData();
    }
  }, []);

  const fetchReportData = async () => {
    // Replace with actual API call
    const data = [
      { month: "2023-01-01", revenue: 40000, expenses: 35000, profit: 5000 },
      { month: "2023-02-01", revenue: 45000, expenses: 38000, profit: 7000 },
      { month: "2023-03-01", revenue: 48000, expenses: 40000, profit: 8000 },
      { month: "2023-04-01", revenue: 52000, expenses: 42000, profit: 10000 },
      { month: "2023-05-01", revenue: 55000, expenses: 45000, profit: 10000 },
      { month: "2023-06-01", revenue: 58000, expenses: 47000, profit: 11000 },
    ];
    setReportData(data);

    const pieData = [
      { name: "Tuition", value: 60 },
      { name: "Books", value: 15 },
      { name: "Fees", value: 10 },
      { name: "Donations", value: 10 },
      { name: "Other", value: 5 },
    ];
    setPieChartData(pieData);
  };

  const generateReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const filteredData = reportData.filter(
      (item) => item.month >= startDate && item.month <= endDate
    );

    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
    const totalExpenses = filteredData.reduce(
      (sum, item) => sum + item.expenses,
      0
    );
    const totalProfit = filteredData.reduce(
      (sum, item) => sum + item.profit,
      0
    );

    const summary = `
      This financial report covers the period from ${new Date(
        startDate
      ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.
      During this period, the total revenue was $${totalRevenue.toLocaleString()}, 
      with total expenses of $${totalExpenses.toLocaleString()}, 
      resulting in a total profit of $${totalProfit.toLocaleString()}.
      ${
        totalProfit > 0
          ? "The company showed a positive financial performance during this period."
          : "The company faced some financial challenges during this period."
      }
      ${
        filteredData.length > 1
          ? `The highest monthly revenue was $${Math.max(
              ...filteredData.map((item) => item.revenue)
            ).toLocaleString()}, 
           while the lowest was $${Math.min(
             ...filteredData.map((item) => item.revenue)
           ).toLocaleString()}.`
          : ""
      }
    `;

    const report = {
      title: "Financial Report",
      startDate: new Date(startDate).toLocaleDateString(),
      endDate: new Date(endDate).toLocaleDateString(),
      financialData: filteredData,
      revenueDistribution: pieChartData,
      summary: summary.trim(),
    };
    setGeneratedReport(report);
  };

  const printReport = () => {
    window.print();
  };

  //   const exportReport = () => {
  //     const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
  //       JSON.stringify(generatedReport, null, 2)
  //     )}`;
  //     const link = document.createElement("a");
  //     link.href = jsonString;
  //     link.download = "financial_report.json";
  //     link.click();
  //   };

  const exportReport = (format) => {
    if (format === "json") {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(generatedReport, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "financial_report.json";
      link.click();
    } else if (format === "csv") {
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add header
      csvContent += "Month,Revenue,Expenses,Profit\n";

      // Add data rows
      generatedReport.financialData.forEach((item) => {
        csvContent += `${item.month},${item.revenue},${item.expenses},${item.profit}\n`;
      });

      // Add summary
      csvContent += "\nSummary\n";
      csvContent += generatedReport.summary.replace(/\n/g, " ") + "\n";

      // Add revenue distribution
      csvContent += "\nRevenue Distribution\n";
      generatedReport.revenueDistribution.forEach((item) => {
        csvContent += `${item.name},${item.value}%\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "financial_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="rounded-lg max-full mx-auto">
      {/* <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        Financial Reports
      </h2> */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* ... (BarChart and PieChart components remain the same) ... */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-cyan-700">
            Financial Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
              <Bar dataKey="expenses" fill="#82ca9d" />
              <Bar dataKey="profit" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-cyan-700">
            Expenses Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300} >
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
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
      </div>
      <div className="mt-6 flex justify-end">
        {/* <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          Generate Report
        </button> */}
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {!generatedReport ? (
            <div className="date-selection">
              <h2 className="text-2xl font-bold mb-4">Select Date Range</h2>
              <div className="mb-4 flex space-x-4">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
              <button
                onClick={generateReport}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Generate Report
              </button>
            </div>
          ) : (
            <div className="generated-report">
              <h2 className="text-2xl font-bold mb-4">
                {generatedReport.title}
              </h2>
              <p className="mb-4">
                Period: {generatedReport.startDate} to {generatedReport.endDate}
              </p>

              <h3 className="text-xl font-semibold mb-2">Financial Data</h3>
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                    <th>Expenses</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReport.financialData.map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.month).toLocaleDateString()}</td>
                      <td>GHC {item.revenue.toLocaleString()}</td>
                      <td>GHC {item.expenses.toLocaleString()}</td>
                      <td>GHC {item.profit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Summary</h3>
                <p className="whitespace-pre-line">{generatedReport.summary}</p>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Revenue Distribution
              </h3>
              <ul>
                {generatedReport.revenueDistribution.map((item, index) => (
                  <li key={index}>
                    {item.name}: {item.value}%
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={printReport}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  <FaPrint className="mr-2" /> Print
                </button>
                <button
                  onClick={() => exportReport("json")}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  <FaFileExport className="mr-2" /> Export JSON
                </button>
                <button
                  onClick={() => exportReport("csv")}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  <FaFileExport className="mr-2" /> Export CSV
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default FinancialReports;
