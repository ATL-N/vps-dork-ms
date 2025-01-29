// pages/dashboard/financial/components/RecordPayment.js
import React, { useState, useEffect } from "react";
import { FaSearch, FaMoneyBillWave } from "react-icons/fa";

const RecordPayment = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    // Replace with actual API call
    const data = [
      { id: 1, name: "John Doe", grade: "10th", outstandingBalance: 1000 },
      { id: 2, name: "Jane Smith", grade: "11th", outstandingBalance: 1500 },
      { id: 3, name: "Alice Johnson", grade: "9th", outstandingBalance: 800 },
    ];
    setStudents(data);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchTerm("");
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    // Replace with actual API call to record payment
    console.log("Recording payment for:", selectedStudent);
    console.log("Amount:", amount);
    console.log("Payment Method:", paymentMethod);
    console.log("Reference:", reference);
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4 max-h-40 overflow-y-auto">
        {students
          .filter((student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((student) => (
            <div
              key={student.id}
              onClick={() => handleStudentSelect(student)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {student.name} - {student.grade} (Outstanding: $
              {student.outstandingBalance})
            </div>
          ))}
      </div>
      {selectedStudent && (
        <form onSubmit={handleRecordPayment}>
          <div className="mb-4">
            <p>
              Selected Student: <strong>{selectedStudent.name}</strong>
            </p>
            <p>
              Outstanding Balance:{" "}
              <strong>${selectedStudent.outstandingBalance}</strong>
            </p>
          </div>
          <div className="mb-4">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              required
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="creditCard">Credit Card</option>
              <option value="bankTransfer">Bank Transfer</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="reference"
              className="block text-sm font-medium text-gray-700"
            >
              Reference Number
            </label>
            <input
              type="text"
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            <FaMoneyBillWave className="inline-block mr-2" />
            Record Payment
          </button>
        </form>
      )}
    </div>
  );
};

export default RecordPayment;
