// pages/dashboard/messaging/emailtemplates.js
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave } from "react-icons/fa";

const EmailTemplates = ({ onClose, onSave }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        name: "Welcome Email",
        subject: "Welcome to Our School",
        content:
          "Dear {name},\n\nWelcome to our school! We're excited to have you join us...",
      },
      {
        id: 2,
        name: "Event Reminder",
        subject: "Reminder: {event_name}",
        content:
          "Dear {name},\n\nThis is a reminder about the upcoming event: {event_name}...",
      },
      // Add more template data as needed
    ];
    setTemplates(data);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditMode(false);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate({ id: Date.now(), name: "", subject: "", content: "" });
    setEditMode(true);
  };

  const handleEditTemplate = () => {
    setEditMode(true);
  };

  const handleDeleteTemplate = async () => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      // Replace with actual API call
      console.log("Deleting template:", selectedTemplate.id);
      await fetchTemplates();
      setSelectedTemplate(null);
    }
  };

  const handleSaveTemplate = async () => {
    // Replace with actual API call
    console.log("Saving template:", selectedTemplate);
    onSave(selectedTemplate);
    await fetchTemplates();
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedTemplate((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">Email Templates</h2>
      <div className="flex">
        <div className="w-1/3 pr-4">
          <button
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center mb-4"
            onClick={handleCreateTemplate}
          >
            <FaPlus className="mr-2" /> New Template
          </button>
          <ul className="space-y-2">
            {templates.map((template) => (
              <li
                key={template.id}
                className={`cursor-pointer p-2 rounded ${
                  selectedTemplate && selectedTemplate.id === template.id
                    ? "bg-cyan-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                {template.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3">
          {selectedTemplate && (
            <div>
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {editMode ? "Edit Template" : "Template Details"}
                </h3>
                <div>
                  {!editMode && (
                    <>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                        onClick={handleEditTemplate}
                      >
                        <FaEdit className="inline mr-2" /> Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleDeleteTemplate}
                      >
                        <FaTrash className="inline mr-2" /> Delete
                      </button>
                    </>
                  )}
                  {editMode && (
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={handleSaveTemplate}
                    >
                      <FaSave className="inline mr-2" /> Save
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Template Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="name"
                    type="text"
                    name="name"
                    value={selectedTemplate.name}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="subject"
                  >
                    Subject
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="subject"
                    type="text"
                    name="subject"
                    value={selectedTemplate.subject}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="content"
                  >
                    Content
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="content"
                    name="content"
                    rows="10"
                    value={selectedTemplate.content}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          className="bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EmailTemplates;
