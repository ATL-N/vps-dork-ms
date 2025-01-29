// components/AddEditStaffPage.js
"use client";

import React from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaVenusMars,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaMoneyBill,
  FaBook,
  FaUpload,
  FaHeartbeat,
  FaIdCard,
  FaPassport,
  FaBriefcase,
  FaUserTie,
  FaNotesMedical,
  FaAllergies,
  FaSyringe,
} from "react-icons/fa";
import {
  SelectField,
  InputField,
  TextAreaField,
} from "../inputFieldSelectField";

const AddEditStaffPage = ({
  formData,
  handleSubmit,
  handleChange,
  handleImageChange,
  imagePreview,
  onCancel,
  id,
}) => {

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const get20YearsAgoString = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 15);
    return date.toISOString().split("T")[0];
  };

  const title = id
    ? `Edit ${formData.first_name}(${formData.staff_id}) Details`
    : "Add new staff";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600"
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
              alt="Staff preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FaUser size={48} />
            </div>
          )}
        </div>
        <input
          type="file"
          id="photo"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <label
          htmlFor="photo"
          className="cursor-pointer bg-cyan-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-cyan-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500 transition-colors flex items-center"
        >
          <FaUpload className="mr-2" />
          Upload Staff Photo
        </label>
      </div>

      <div className="space-y-8">
        {/* Staff Information */}
        <section className="text-cyan-600">
          <h3 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
            Staff Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="first_name"
              icon={<FaUser />}
              value={formData.first_name}
              onChange={handleChange}
            />
            <InputField
              label="Last Name"
              name="last_name"
              icon={<FaUser />}
              value={formData.last_name}
              onChange={handleChange}
            />
            <InputField
              label="Middle Name"
              name="middle_name"
              isRequired={false}
              icon={<FaUser />}
              value={formData.middle_name}
              onChange={handleChange}
            />
            <InputField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              icon={<FaCalendarAlt />}
              value={formData.date_of_birth}
              onChange={handleChange}
              max={get20YearsAgoString()}
            />
            <SelectField
              label="Gender"
              name="gender"
              icon={<FaVenusMars />}
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Gender" },
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
                { value: "O", label: "Other" },
              ]}
            />
            <SelectField
              label="Marital Status"
              name="marital_status"
              icon={<FaUserTie />}
              value={formData.marital_status}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Marital Status" },
                { value: "Single", label: "Single" },
                { value: "Married", label: "Married" },
                { value: "Divorced", label: "Divorced" },
                { value: "Widowed", label: "Widowed" },
              ]}
            />
            <InputField
              label="Phone Number"
              name="phone_number"
              type="tel"
              icon={<FaPhone />}
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+233 545067890"
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              icon={<FaEnvelope />}
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              isRequired={false}
            />
            <InputField
              label="Emergency Contact"
              name="emergency_contact"
              icon={<FaPhone />}
              value={formData.emergency_contact}
              onChange={handleChange}
              type="tel"
              placeholder="+233 545067890"
            />
            <InputField
              label="Date of Joining"
              name="date_of_joining"
              type="date"
              icon={<FaCalendarAlt />}
              value={formData.date_of_joining}
              onChange={handleChange}
              max={getTodayString()}
            />
            {/* <InputField
              label="Designation"
              name="designation"
              isRequired={false}
              icon={<FaBriefcase />}
              value={formData.designation}
              onChange={handleChange}
            /> */}
            <InputField
              label="Department"
              name="department"
              icon={<FaBook />}
              value={formData.department}
              onChange={handleChange}
              isRequired={false}
            />
            <InputField
              label="Salary"
              name="salary"
              type="number"
              icon={<FaMoneyBill />}
              value={formData.salary}
              onChange={handleChange}
              placeholder="GHC"
            />
            <InputField
              label="Account Number"
              name="account_number"
              isRequired={false}
              icon={<FaIdCard />}
              value={formData.account_number}
              onChange={handleChange}
            />
            <SelectField
              label="Contract Type"
              name="contract_type"
              icon={<FaBriefcase />}
              value={formData.contract_type}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Contract Type" },
                { value: "Full-time", label: "Full-time" },
                { value: "Part-time", label: "Part-time" },
                { value: "Contract", label: "Contract" },
              ]}
            />
            <SelectField
              label="Employment Status"
              name="employment_status"
              icon={<FaUserTie />}
              value={formData.employment_status}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Employment Status" },
                { value: "Active", label: "Active" },
                { value: "On Leave", label: "On Leave" },
                { value: "Terminated", label: "Terminated" },
              ]}
            />
            <InputField
              label="Qualification"
              name="qualification"
              icon={<FaGraduationCap />}
              value={formData.qualification}
              onChange={handleChange}
            />
            <InputField
              label="Experience"
              name="experience"
              icon={<FaBriefcase />}
              value={formData.experience}
              onChange={handleChange}
              isRequired={false}
            />

            <SelectField
              label="Role"
              name="role"
              icon={<FaVenusMars />}
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "", label: "Select staff role" },
                // { value: "admin", label: "admin" },
                { value: "head staff", label: "head teacher" },
                { value: "teaching staff", label: "teaching staff" },
                { value: "non teaching", label: "non teaching staff" },
              ]}
            />

            {formData.role === "teaching staff" && (
              <InputField
                label="Teaching Subject"
                name="teaching_subject"
                icon={<FaBook />}
                value={formData.teaching_subject}
                onChange={handleChange}
                isRequired={false}
              />
            )}

            <InputField
              label="National ID"
              name="national_id"
              icon={<FaIdCard />}
              value={formData.national_id}
              onChange={handleChange}
              isRequired={false}
            />
            <InputField
              label="Passport Number"
              name="passport_number"
              isRequired={false}
              icon={<FaPassport />}
              value={formData.passport_number}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-3">
            <TextAreaField
              label="Residential Address"
              name="address"
              icon={<FaNotesMedical className="text-gray-400" />}
              placeholder="Ghana Post GPS, 123 Main St, Town/City, Region, Country"
              onChange={handleChange}
              value={formData.address}
            />
          </div>

          <h3 className="text-xl font-semibold text-cyan-600 mt-8 mb-4">
            Medical Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField
              label="Medical Conditions"
              name="medical_conditions"
              icon={<FaNotesMedical className="text-gray-400" />}
              value={formData.medical_conditions}
              onChange={handleChange}
              placeholder="Enter medical conditions"
              // isRequired={false}
            />

            <TextAreaField
              label="Allergies"
              name="allergies"
              icon={<FaAllergies className="text-gray-400" />}
              value={formData.allergies}
              onChange={handleChange}
              placeholder="Enter allergies"
              // isRequired={false}
            />
            <TextAreaField
              label="Vaccination Status"
              name="vaccination_status"
              icon={<FaSyringe className="text-gray-400" />}
              value={formData.vaccination_status}
              onChange={handleChange}
              placeholder="Enter vaccination status details"
              // isRequired={false}
            />

            <SelectField
              label="Blood Group"
              name="blood_group"
              icon={<FaHeartbeat />}
              value={formData.blood_group}
              onChange={handleChange}
              isRequired={false}
              options={[
                { value: "", label: "Select Blood Group" },
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
            />
          </div>

          {/* <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>
              <textarea
                name="address"
                rows="3"
                className="pl-10 w-full p-2 border border-gray-300 min-[5vh]: rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="123 Main St, City, Country"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          </div> */}
        </section>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          {id ? "Update Staff" : "Add Staff"}
        </button>
      </div>
    </form>
  );
};

export default AddEditStaffPage;
