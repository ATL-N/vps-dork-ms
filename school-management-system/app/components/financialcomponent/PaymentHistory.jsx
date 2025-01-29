// pages/dashboard/financial/components/PaymentHistory.js
import React, { useState, useEffect } from "react";
import { FaSearch, FaDownload } from "react-icons/fa";

const PaymentHistory = ({ onClose }) => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        date: "2024-07-20",
        student: "John Doe",
        amount: 500,
        method: "Credit Card",
        status: "Completed",
      },
      {
        id: 2,
        date: "2024-07-19",
        student: "Jane Smith",
        amount: 750,
        method: "Bank Transfer",
        status: "Pending",
      },
      {
        id: 3,
        date: "2024-07-18",
        student: "Alice Johnson",
        amount: 600,
        method: "Cash",
        status: "Completed",
      },
    ];
    setPayments(data);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting payment history...");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Payment History</h2>
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-2/3 p-2 border rounded"
        />
        <button
          onClick={handleExport}
          className="p-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          <FaDownload className="inline-block mr-2" />
          Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments
              .filter((payment) =>
                payment.student.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="px-4 py-2">{payment.date}</td>
                  <td className="px-4 py-2">{payment.student}</td>
                  <td className="px-4 py-2">${payment.amount}</td>
                  <td className="px-4 py-2">{payment.method}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        payment.status === "Completed"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
