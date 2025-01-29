"use client";

import { FaBuilding, FaUserTie, FaInfoCircle } from "react-icons/fa";
import {
  SelectField,
  InputField,
} from "../inputFieldSelectField";

const AddEditDepartmentPage = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
  staffData
}) => {
  console.log('staffData', staffData)

  const title = id ? `Edit ${formData.name} Details` : "Add New Department";

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
            Department Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              type="text"
              label="Department Name"
              name="department_name"
              icon={<FaBuilding />}
              value={formData.department_name}
              onChange={handleChange}
              placeholder="e.g. culture department"
              required
            />

            <SelectField
              label="Department Head"
              name="head_of_department"
              icon={<FaUserTie />}
              value={formData.head_of_department}
              onChange={handleChange}
              title="Select Department Head"
              options={[
                { value: "", label: "Select a department head" },
                ...staffData.map((staff) => ({
                  value: staff.staff_id,
                  label: staff.first_name,
                })),
              ]}
            />

            <div className="col-span-2">
              <div className="text-cyan-600">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor={"description"}
                >
                  Description
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-4 flex items-center pointer-events-none">
                    <FaInfoCircle />
                  </div>
                </div>
              </div>
              <textarea
                name="description"
                id="description"
                placeholder="Enter department description"
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
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
          {id ? "Update Department" : "Add Department"}
        </button>
      </div>
    </form>
  );
};

export default AddEditDepartmentPage;
