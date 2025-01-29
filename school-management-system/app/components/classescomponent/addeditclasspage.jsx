// components/AddEditClassPage.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaBook,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaDoorOpen,
  FaUpload,
} from "react-icons/fa";
import { SelectField, InputField } from "../inputFieldSelectField";

const AddEditClassPage = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
  staffData,
}) => {
  let teachingStaff;

  function extractStaffData(staffData) {
    return staffData?.map((staff) => ({
      name: `${staff.first_name.trim()} ${staff.middle_name.trim()} ${staff.last_name.trim()}`,
      department: staff.department,
      role: staff.role,
      staff_id: staff.staff_id,
    }));
  }

  staffData = extractStaffData(staffData);
  //  console.log('staffData', staffData)

  if (staffData) {
    teachingStaff = staffData.filter(
      (teacher) => teacher.role === "teaching staff"
    );
  }

  const title = id ? `Edit ${formData?.class_name} Details` : "Add New Class";

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
            Class Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Class Name"
              name="class_name"
              icon={<FaBook />}
              value={formData?.class_name}
              onChange={handleChange}
              placeholder="e.g. Class 1, JHS 1"
            />

            <InputField
              label="Room Name/Number"
              name="room_number"
              icon={<FaDoorOpen />}
              value={formData?.room_number}
              onChange={handleChange}
              placeholder="e.g. 101"
              type="text"
              isRequired={false}
            />

            <SelectField
              label="Class Teacher"
              name="staff_id"
              icon={<FaChalkboardTeacher />}
              value={formData?.staff_id}
              onChange={handleChange}
              title="Select teacher for the staff"
              options={[
                { value: "", label: "Select Class Teacher" },
                ...teachingStaff?.map((teacher) => ({
                  value: teacher.staff_id,
                  label: teacher.name,
                })),
              ]}
            />

            <SelectField
              label="Class Level"
              name="class_level"
              icon={<FaLayerGroup />}
              value={formData?.class_level}
              onChange={handleChange}
              title="Select Class Level"
              options={[
                { value: "", label: "Select Class Level" },
                { value: "Pre School", label: "Pre School" },
                { value: "Primary", label: "Primary" },
                { value: "JHS", label: "Junior High School" },
              ]}
            />

            <InputField
              label="Class Capacity"
              name="capacity"
              icon={<FaDoorOpen />}
              value={formData?.capacity}
              onChange={handleChange}
              placeholder="e.g. 30"
              type="number"
              max={60}
              title={"this is the maximum class capacity"}
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
          {id ? "Update Class" : "Add Class"}
        </button>
      </div>
    </form>
  );
};

export default AddEditClassPage;
