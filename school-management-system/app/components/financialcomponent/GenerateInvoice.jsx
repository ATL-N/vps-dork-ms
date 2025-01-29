// pages/dashboard/financial/components/GenerateInvoice.js
import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaMinus } from "react-icons/fa";

const GenerateInvoice = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeStructures, setFeeStructures] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchFeeStructures();
  }, []);

  const fetchStudents = async () => {
    // Replace with actual API call
    const data = [
      { id: 1, name: "John Doe", grade: "10th" },
      { id: 2, name: "Jane Smith", grade: "11th" },
      { id: 3, name: "Alice Johnson", grade: "9th" },
    ];
    setStudents(data);
  };

  const fetchFeeStructures = async () => {
    // Replace with actual API call
    const data = [
      { id: 1, name: "Tuition Fee", amount: 5000 },
      { id: 2, name: "Library Fee", amount: 200 },
      { id: 3, name: "Lab Fee", amount: 300 },
    ];
    setFeeStructures(data);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchTerm("");
  };

  const handleAddInvoiceItem = (feeStructure) => {
    setInvoiceItems([...invoiceItems, { ...feeStructure, quantity: 1 }]);
  };

  const handleRemoveInvoiceItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index].quantity = Math.max(1, newQuantity);
    setInvoiceItems(updatedItems);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce(
      (total, item) => total + item.amount * item.quantity,
      0
    );
  };

  const handleGenerateInvoice = async () => {
    // Replace with actual API call to generate and save invoice
    console.log("Generating invoice for:", selectedStudent);
    console.log("Invoice items:", invoiceItems);
    console.log("Total amount:", calculateTotal());
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Generate Invoice</h2>
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
              {student.name} - {student.grade}
            </div>
          ))}
      </div>
      {selectedStudent && (
        <div>
          <h3 className="font-bold mb-2">
            Selected Student: {selectedStudent.name}
          </h3>
          <h4 className="font-semibold mb-2">Add Fee Items:</h4>
          <div className="mb-4 max-h-40 overflow-y-auto">
            {feeStructures.map((fee) => (
              <div
                key={fee.id}
                className="flex justify-between items-center p-2 hover:bg-gray-100"
              >
                <span>
                  {fee.name} - ${fee.amount}
                </span>
                <button
                  onClick={() => handleAddInvoiceItem(fee)}
                  className="text-cyan-600 hover:text-cyan-800"
                >
                  <FaPlus />
                </button>
              </div>
            ))}
          </div>
          <h4 className="font-semibold mb-2">Invoice Items:</h4>
          <div className="mb-4">
            {invoiceItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border-b"
              >
                <span>{item.name}</span>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      handleQuantityChange(index, item.quantity - 1)
                    }
                    className="text-cyan-600 hover:text-cyan-800 mr-2"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value))
                    }
                    className="w-16 text-center border rounded"
                    min="1"
                  />
                  <button
                    onClick={() =>
                      handleQuantityChange(index, item.quantity + 1)
                    }
                    className="text-cyan-600 hover:text-cyan-800 ml-2"
                  >
                    <FaPlus />
                  </button>
                  <span className="ml-4">${item.amount * item.quantity}</span>
                  <button
                    onClick={() => handleRemoveInvoiceItem(index)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <FaMinus />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right mb-4">
            <strong>Total: ${calculateTotal()}</strong>
          </div>
          <button
            onClick={handleGenerateInvoice}
            className="w-full p-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            Generate Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default GenerateInvoice;
