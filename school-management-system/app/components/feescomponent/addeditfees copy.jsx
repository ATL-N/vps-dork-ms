import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaVenusMars,
  FaMoneyBill,
  FaNotesMedical,
} from "react-icons/fa";
import {
  InputField,
  SelectField,
  TextAreaField,
} from "../inputFieldSelectField";
import { getTodayString } from "../../config/configFile";

const Addeditfees = ({
  formData,
  handleSubmit,
  handleChange,
  imagePreview,
  onCancel,
  id,
  studentData,
  sendSMS,
  setSendSMS,
  printReceipt,
  setPrintReceipt,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {id ? "Edit Fees" : "Receive Fees"}
              </h2>
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Student"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="first_name"
                icon={<FaUser className="text-cyan-600" />}
                value={formData.first_name}
                onChange={handleChange}
                isReadOnly={studentData}
                isRequired={true}
                className="bg-gray-50"
              />
              <InputField
                label="Last Name"
                name="last_name"
                icon={<FaUser className="text-cyan-600" />}
                value={formData.last_name}
                onChange={handleChange}
                isReadOnly={true}
                isRequired={true}
                className="bg-gray-50"
              />
            </div>

            {/* Fee Details */}
            <div className="bg-cyan-50 p-4 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Current Fees Owed (GHC)"
                  name="old_balance"
                  type="number"
                  isReadOnly={true}
                  isRequired={true}
                  icon={<FaMoneyBill className="text-cyan-600" />}
                  value={`${-formData.old_balance}`}
                  onChange={handleChange}
                  className="bg-white"
                />
                <InputField
                  label="New Balance (GHC)"
                  name="new_balance"
                  type="number"
                  isRequired={true}
                  icon={<FaMoneyBill className="text-cyan-600" />}
                  value={-formData.new_balance || 0}
                  onChange={handleChange}
                  isReadOnly={true}
                  className="bg-white"
                />
              </div>

              <InputField
                label="Amount Receiving (GHC)"
                name="amount_received"
                type="number"
                isRequired={true}
                icon={<FaMoneyBill className="text-cyan-600" />}
                value={formData.amount_received}
                onChange={handleChange}
                className="bg-white"
                min={0}
              />
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Cash In Hand (GHC)"
                name="cash_in_hand"
                type="number"
                icon={<FaMoneyBill className="text-cyan-600" />}
                value={formData.cash_in_hand}
                onChange={handleChange}
                className="bg-gray-50"
                min={formData?.amount_received}
              />
              <InputField
                label="Cash Balance"
                name="cash_balance"
                type="number"
                icon={<FaCalendarAlt className="text-cyan-600" />}
                value={`${formData.cash_balance}`}
                onChange={handleChange}
                isReadOnly={true}
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Payment Date"
                name="payment_date"
                type="date"
                icon={<FaCalendarAlt className="text-cyan-600" />}
                value={formData.payment_date}
                onChange={handleChange}
                max={getTodayString()}
                className="bg-gray-50"
              />
              <SelectField
                label="Payment Mode"
                name="payment_mode"
                icon={<FaVenusMars className="text-cyan-600" />}
                value={formData.payment_mode}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select payment mode" },
                  { value: "Cash", label: "Cash" },
                  { value: "Momo", label: "Mobile Money" },
                  { value: "Bank", label: "Bank Transfer" },
                ]}
                className="bg-gray-50"
              />
            </div>

            <TextAreaField
              label="Comments"
              name="comments"
              icon={<FaNotesMedical className="text-cyan-600" />}
              placeholder="Add any additional notes or comments here..."
              onChange={handleChange}
              value={formData.comments}
              className="bg-gray-50"
              isRequired={false}
            />

            {/* Options */}
            <div className="space-y-3 border-t pt-4">
              {isOnline && (
                <label className="flex items-center space-x-3 text-gray-700">
                  <input
                    type="checkbox"
                    checked={sendSMS}
                    onChange={(e) => setSendSMS(e.target.checked)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <span>Send SMS notification to parent/guardian</span>
                </label>
              )}

              <label className="flex items-center space-x-3 text-gray-700">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <span>Print receipt</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              Complete Payment
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Addeditfees;
