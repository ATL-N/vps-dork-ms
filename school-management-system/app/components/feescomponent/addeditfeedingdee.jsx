// components/AddStudentForm.js
"use client";

import React from "react";
import { useParams } from "next/navigation";

import {
  FaUser,
  FaCalendarAlt,
  FaVenusMars,
  FaPhone,
  FaEnvelope,
  FaSchool,
  FaMoneyBill,
  FaUpload,
  FaNotesMedical,
} from "react-icons/fa";
import {
  SelectField,
  InputField,
  TextAreaField,
} from "../inputFieldSelectField";
import { get20YearsAgoString, getTodayString } from "../../config/configFile";

const AddeditfeedingnTnt = ({
  formData,
  handleSubmit,
  handleChange,
  imagePreview,
  onCancel,
  id,
  studentData
}) => {
  const title = id ? `Edit Fees` : "Feeding Fee Fees";


  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
        {title}
      </h2>

      {/* Image Upload Section */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Student preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FaUser size={48} />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Student Information */}
        <section>
          <h3 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
            Student Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name *"
              name="first_name"
              icon={<FaUser />}
              value={formData.first_name}
              onChange={handleChange}
              isReadOnly={studentData}
            />
            <InputField
              label="Last Name *"
              name="last_name"
              icon={<FaUser />}
              value={formData.last_name}
              onChange={handleChange}
              isReadOnly={true}
              isRequired={true}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Current Fees Owed(GHC) *"
              name="old_balance"
              type="number"
              isReadOnly={true}
              icon={<FaMoneyBill />}
              // value={-studentData?.old_balance}
              value={`${-formData.old_balance}`}
              onChange={handleChange}
              placeholder="GHC"
            />
            <InputField
              label="New Balance(GHC)"
              name="new_balance"
              type="number"
              icon={<FaMoneyBill />}
              value={-formData.new_balance || 0}
              onChange={handleChange}
              isRequired={false}
              isReadOnly={true}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-3">
            <InputField
              label="Fees Received / Fees Being Paid (GHC) *"
              name="amount_received"
              type="number"
              icon={<FaMoneyBill />}
              value={formData.amount_received}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
            <InputField
              label="Cash In Hand(GHC) *"
              name="cash_in_hand"
              type="number"
              icon={<FaMoneyBill />}
              value={formData.cash_in_hand}
              onChange={handleChange}
              // min={formData.amount_received}
            />
            <InputField
              label="Cash Balance"
              name="cash_balance"
              type="number"
              icon={<FaCalendarAlt />}
              value={`${formData.cash_balance}`}
              onChange={handleChange}
              isReadOnly={true}
            />
            <InputField
              label="Payment Date *"
              name="payment_date"
              type="date"
              icon={<FaMoneyBill />}
              value={formData.payment_date}
              onChange={handleChange}
              max={getTodayString()}
            />

            <SelectField
              label="Payment mode/type"
              name="payment_mode"
              icon={<FaVenusMars />}
              value={formData.payment_mode}
              onChange={handleChange}
              options={[
                { value: "", label: "Select payment mode" },
                { value: "Cash", label: "Cash" },
                { value: "Momo", label: "Momo" },
                { value: "Bank", label: "Bank" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-3 text-cyan-700">
            <TextAreaField
              label="Comments"
              name="comments"
              isRequired={false}
              icon={<FaNotesMedical className="text-gray-400" />}
              placeholder="Ghana Post GPS, 123 Main St, Town/City, Region, Country"
              onChange={handleChange}
              value={formData.comments}
            />
          </div>
        </section>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          Pay Fee
        </button>
      </div>
    </form>
  );
};

export default AddeditfeedingnTnt;
