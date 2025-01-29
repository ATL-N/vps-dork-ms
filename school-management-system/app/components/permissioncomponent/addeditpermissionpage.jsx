// components/AddEditClassPage.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaBook,
  FaBuilding
} from "react-icons/fa";
import { SelectField, InputField } from "../inputFieldSelectField";

const AddEditPermissionPage = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
}) => {

  const title = id ? `Edit ${formData?.permission_name} Details` : "Add New user permission";

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
            Permission Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Permission Name"
              name="permission_name"
              icon={<FaBuilding />}
              value={formData?.permission_name}
              onChange={handleChange}
              placeholder="e.g. Add Staff, Delete class etc"
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
          {id ? "Update permission" : "Add permission"}
        </button>
      </div>
    </form>
  );
};

export default AddEditPermissionPage;
