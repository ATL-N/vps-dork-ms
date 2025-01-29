// components/suppliers/AddEditSupplierpage.js
import React, { useState } from "react";
import { FaCalendarPlus, FaCalendar, FaBookOpen } from "react-icons/fa";
import { InputField, TextAreaField } from "../inputFieldSelectField";
import { FaLocationPin } from "react-icons/fa6";

const AddEditSupplierpage = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
}) => {

 
  const title = id
    ? `Edit Supplier Details`
    : "Add New supplier";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600"
    >
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
        {title}
      </h2>

      <div className="space-y-8">
        <section className="text-cyan-600">
          <h3 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
            Supplier Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              type="text"
              label="supplier Name"
              name="supplier_name"
              icon={<FaCalendar />}
              value={formData?.supplier_name}
              onChange={handleChange}
              placeholder="e.g. Aki Ola Publications, CEPME... etc"
            />

            <InputField
              type="text"
              label=" Contact name"
              name="contact_name"
              icon={<FaCalendarPlus />}
              value={formData?.contact_name}
              onChange={handleChange}
              placeholder="e.g. Mr. Katah, Prof... etc"
              title="the supplier contact name"
            />

            <InputField
              type="tel"
              label="Contact phone"
              name="contact_phone"
              icon={<FaCalendarPlus />}
              value={formData?.contact_phone}
              onChange={handleChange}
              placeholder="e.g. 0551577446, +233 504238397 etc"
              title="the supplier contact number"
            />

            <InputField
              type="email"
              label="Contact email"
              name="contact_email"
              icon={<FaCalendarPlus />}
              value={formData?.contact_email}
              onChange={handleChange}
              placeholder="e.g. atlcoccus@gmail.com... etc"
              title="the supplier contact name"
            />

            <TextAreaField
              label="Supplier address"
              name="address"
              icon={<FaLocationPin className="text-gray-400" />}
              placeholder="Address..."
              onChange={handleChange}
              value={formData.address}
            />

            <TextAreaField
              label="Details / Description"
              name="details"
              icon={<FaBookOpen className="text-gray-400" />}
              placeholder="Describe the supplier for easy recordnition"
              onChange={handleChange}
              value={formData.details}
              isRequired={false}
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
          Close
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          {id ? "Update supplier" : "Add supplier"}
        </button>
      </div>
    </form>
  );
};

export default AddEditSupplierpage;
