// pages/dashboard/settings/general.js
"use client";

import React, { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: null,
  });

  useEffect(() => {
    // Fetch current settings from API
    // Replace with actual API call
    const fetchedSettings = {
      schoolName: "Example School",
      address: "123 Education St, City, State, ZIP",
      phone: "(123) 456-7890",
      email: "info@exampleschool.com",
      website: "www.exampleschool.com",
      logo: null,
    };
    setSettings(fetchedSettings);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setSettings((prev) => ({ ...prev, logo: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit updated settings to API
    console.log("Submitting settings:", settings);
    // Add API call here
  };

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        General Settings
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">School Name</label>
            <input
              type="text"
              name="schoolName"
              value={settings.schoolName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={settings.website}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">School Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
        >
          <FaSave className="mr-2" /> Save Settings
        </button>
      </form>
    </div>
  );
};

export default GeneralSettings;
