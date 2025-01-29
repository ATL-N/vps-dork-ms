// components/semesters/addnewsemester.js
import React, { useState } from "react";
import { FaCalendarPlus, FaCalendar, FaVenusMars } from "react-icons/fa";
import { InputField, SelectField } from "../inputFieldSelectField";

const AddNewSemester = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
}) => {

 
  const title = id
    ? `Edit ${formData?.semester_name} Details`
    : "Add New semester";

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
            Semester Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              type="text"
              label="Semester/Term Name"
              name="semester_name"
              icon={<FaCalendar />}
              value={formData?.semester_name}
              onChange={handleChange}
              placeholder="e.g. First semester, First term etc"
            />

            {id && (
              <SelectField
                label="Status"
                name="status"
                icon={<FaVenusMars />}
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Status" },
                  { value: "completed", label: "completed" },
                  { value: "active", label: "active" },
                  { value: "upcoming", label: "upcoming" },
                ]}
              />
            )}

            {!id && (
              <SelectField
                label="Status"
                name="status"
                icon={<FaVenusMars />}
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Status" },
                  { value: "active", label: "active" },
                  { value: "upcoming", label: "upcoming" },
                ]}
              />
            )}

            <InputField
              type="date"
              label="Start Date"
              name="start_date"
              icon={<FaCalendarPlus />}
              value={formData?.start_date}
              onChange={handleChange}
              title="date the semester starts"
            />

            <InputField
              type="date"
              label="End Date"
              name="end_date"
              icon={<FaCalendarPlus />}
              value={formData?.end_date}
              onChange={handleChange}
              title="date the semester ends"
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
          {id ? "Update semester" : "Add semester"}
        </button>
      </div>
    </form>
  );
};

export default AddNewSemester;
