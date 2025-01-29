// pages/dashboard/messaging/broadcastnotifications.js
import React, { useState } from "react";
import { FaUsers, FaBullhorn, FaEnvelope } from "react-icons/fa";

const BroadcastNotifications = ({ onClose, onBroadcast }) => {
  const [notificationData, setNotificationData] = useState({
    recipients: "",
    subject: "",
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotificationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBroadcast(notificationData);
    onClose();
  };

  const confirmSendBulkSms = () => {
    // SEND SMS
    const axios = require("axios");
    const data = {
      sender: "Hello world",
      message: "Welcome to Arkesel SMS API v2. Please enjoy the experience.",
      recipients: ["233553995047", "233544919953"],
      // When sending SMS to Nigerian recipients, specify the use_case field
      // "use_case" = "transactional"
    };

    const config = {
      method: "post",
      url: "https://sms.arkesel.com/api/v2/sms/send",
      headers: {
        "api-key": "cE9QRUkdjsjdfjkdsj9kdiieieififiw=",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        Broadcast Notification
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="recipients"
          >
            <FaUsers className="inline mr-2" /> Recipients
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="recipients"
            name="recipients"
            value={notificationData.recipients}
            onChange={handleChange}
            required
          >
            <option value="">Select recipient group</option>
            <option value="all">All Users</option>
            <option value="students">All Students</option>
            <option value="teachers">All Teachers</option>
            <option value="staff">All Staff</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="subject"
          >
            <FaEnvelope className="inline mr-2" /> Subject
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="subject"
            type="text"
            name="subject"
            value={notificationData.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="content"
          >
            Notification Content
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="content"
            name="content"
            rows="6"
            value={notificationData.content}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            type="submit"
          >
            <FaBullhorn className="mr-2" /> Broadcast Notification
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BroadcastNotifications;