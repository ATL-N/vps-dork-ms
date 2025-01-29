import React, { useState } from "react";
import { FaBell, FaUserFriends, FaExclamationTriangle } from "react-icons/fa";
import {
  InputField,
  TextAreaField,
  SelectField,
} from "../inputFieldSelectField";

const CreateNotification = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
}
) => {


  const title = id
    ? `Edit ${formData?.supplier_name} Details`
    : "Add New Notification";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600"
    >
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
        {title}
      </h2>
      <div className="space-y-6">
        <InputField
          type="text"
          label="Notification Title"
          name="notification_title"
          icon={<FaBell />}
          value={formData.notification_title}
          onChange={handleChange}
          placeholder="Enter notification title"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Notification Type"
            name="notification_type"
            icon={<FaExclamationTriangle />}
            value={formData.notification_type}
            onChange={handleChange}
            options={[
              { value: "general", label: "General" },
              { value: "alert", label: "Alert" },
              { value: "reminder", label: "Reminder" },
            ]}
          />

          <SelectField
            label="Priority"
            name="priority"
            icon={<FaExclamationTriangle />}
            value={formData.priority}
            onChange={handleChange}
            options={[
              { value: "low", label: "Low" },
              { value: "normal", label: "Normal" },
              { value: "high", label: "High" },
            ]}
          />

          <SelectField
            label="Recipient type"
            name="recipient_type"
            icon={<FaExclamationTriangle />}
            value={formData.recipient_type}
            onChange={handleChange}
            options={[
              { value: "", label: "select the recipient type" },
              { value: "all users", label: "All users" },
              { value: "staff", label: "staff" },
              // { value: "non teaching staff", label: "non teaching staff" },
              { value: "students", label: "students" },
              { value: "parents", label: "parents" },
            ]}
          />
        </div>

        <TextAreaField
          label="Notification Message"
          name="notification_message"
          icon={<FaBell />}
          value={formData.notification_message}
          onChange={handleChange}
          placeholder="Enter notification message"
        />

        {/* Add a component for selecting recipients here */}

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
            {id ? "Update notification" : "Send notification"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateNotification;
