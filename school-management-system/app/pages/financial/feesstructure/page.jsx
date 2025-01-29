// pages/dashboard/financial/fee-structure.js
"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Modal from "../../../components/modal/modal";
import CustomTable from "../../../components/listtableForm";


const FeeStructure = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    // Replace with actual API call
    const data = [
      { id: 1, name: "Tuition Fee", amount: 5000, frequency: "Per Semester" },
      { id: 2, name: "Library Fee", amount: 200, frequency: "Annual" },
      { id: 3, name: "Lab Fee", amount: 300, frequency: "Per Semester" },
    ];
    setFeeStructures(data);
  };

const headerNames = [
  "id",
  "name",
  "amount",
  "frequecy",

];
  const handleAddFee = () => {
    setModalContent(
      <AddEditFeeForm
        onClose={() => setShowModal(false)}
        onSave={fetchFeeStructures}
      />
    );
    setShowModal(true);
  };

  const handleEditFee = (fee) => {
    setModalContent(
      <AddEditFeeForm
        fee={fee}
        onClose={() => setShowModal(false)}
        onSave={fetchFeeStructures}
      />
    );
    setShowModal(true);
  };

  const handleDeleteFee = async (feeId) => {
    // Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    fetchFeeStructures();
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">Fee Structure</h1>
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">Fee List</h2>
          <button
            onClick={handleAddFee}
            className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Fee
          </button>
        </div>
        <CustomTable
          data={feeStructures}
          headerNames={headerNames}
          maxTableHeight="40vh"
          height="20vh"
          handleDelete={handleDeleteFee}
          handleEdit={handleEditFee}
          searchTerm={handleEditFee}
          handleSearch={handleEditFee}
        />
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

const AddEditFeeForm = ({ fee, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    fee || { name: "", amount: "", frequency: "" }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Fee Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          required
        />
      </div>
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <input
          type="number"
          name="amount"
          id="amount"
          value={formData.amount}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          required
        />
      </div>
      <div>
        <label
          htmlFor="frequency"
          className="block text-sm font-medium text-gray-700"
        >
          Frequency
        </label>
        <select
          name="frequency"
          id="frequency"
          value={formData.frequency}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          required
        >
          <option value="">Select frequency</option>
          <option value="Per Semester">Per Semester</option>
          <option value="Annual">Annual</option>
          <option value="One-time">One-time</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default FeeStructure;
