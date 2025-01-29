// pages/dashboard/financial/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaFileInvoice,
  FaRegCreditCard,
  FaHistory,
  FaChartLine,
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
} from "recharts";
import StatCard from "../../../components/statcard";
import Link from "next/link";

const FinancialManagement = () => {
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    recentTransactions: 0,
    averagePaymentTime: 0,
  });
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchFinancialStats();
    fetchRevenueData();
  }, []);

  const fetchFinancialStats = async () => {
    // Replace with actual API call
    const data = {
      totalRevenue: 500000,
      pendingPayments: 50000,
      recentTransactions: 25,
      averagePaymentTime: 7,
    };
    setFinancialStats(data);
  };

  const fetchRevenueData = async () => {
    // Replace with actual API call
    const data = [
      { month: "Jan", revenue: 40000 },
      { month: "Feb", revenue: 45000 },
      { month: "Mar", revenue: 48000 },
      { month: "Apr", revenue: 52000 },
      { month: "May", revenue: 55000 },
      { month: "Jun", revenue: 58000 },
    ];
    setRevenueData(data);
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Financial Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaMoneyBillWave />}
          title="Total Revenue"
          value={`$${financialStats.totalRevenue.toLocaleString()}`}
        />
        <StatCard
          icon={<FaFileInvoice />}
          title="Pending Payments"
          value={`$${financialStats.pendingPayments.toLocaleString()}`}
        />
        <StatCard
          icon={<FaRegCreditCard />}
          title="Recent Transactions"
          value={financialStats.recentTransactions}
        />
        <StatCard
          icon={<FaHistory />}
          title="Avg. Payment Time"
          value={`${financialStats.averagePaymentTime} days`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Revenue Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={revenueData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/financial/fee-structure"
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaMoneyBillWave className="mx-auto mb-2 text-2xl" />
              <span>Fee Structure</span>
            </Link>
            <Link
              href="/dashboard/financial/generate-invoice"
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaFileInvoice className="mx-auto mb-2 text-2xl" />
              <span>Generate Invoice</span>
            </Link>
            <Link
              href="/dashboard/financial/record-payment"
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaRegCreditCard className="mx-auto mb-2 text-2xl" />
              <span>Record Payment</span>
            </Link>
            <Link
              href="/dashboard/financial/payment-history"
              className="p-4 bg-cyan-100 rounded-lg text-center hover:bg-cyan-200 transition duration-300"
            >
              <FaHistory className="mx-auto mb-2 text-2xl" />
              <span>Payment History</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-cyan-700">
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Replace with actual data */}
              <tr className="border-b">
                <td className="px-4 py-2">2024-07-20</td>
                <td className="px-4 py-2">John Doe</td>
                <td className="px-4 py-2">$500</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full">
                    Paid
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">2024-07-19</td>
                <td className="px-4 py-2">Jane Smith</td>
                <td className="px-4 py-2">$750</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
