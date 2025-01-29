// pages/dashboard/messaging/FeeReminder.jsx
import React, { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import {
  TextAreaField,
  SelectField,
  MultiSelectDropdown,
} from "../../components/inputFieldSelectField";
import InfoModal from "../../components/modal/infoModal";
import { useSession } from "next-auth/react";
import ConfirmModal from "../../components/modal/confirmModal";

const FeeReminder = ({ onClose, isDetails = false }) => {
  const { data: session } = useSession();
  const [messageData, setMessageData] = useState({
    recipients: "students owing", // Default to students owing
    content: "",
  });
  const [sendingDetails, setSendingDetails] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    invalidNumbers: [],
  });
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoModal, setIsInfoModal] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const [studentsOwing, setStudentsOwing] = useState([]);
  const [selectedStudentsOwing, setSelectedStudentsOwing] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(false);

useEffect(() => {
  const authorizedRoles = ["admin"];
  const authorizedPermissions = ["send sms"];

  if (
    session?.user?.permissions?.some((permission) =>
      authorizedPermissions.includes(permission)
    ) ||
    authorizedRoles.includes(session?.user?.role)
  ) {
    setIsAuthorised(true);
  } else {
    setIsAuthorised(false);
  }
}, [session, status]);


  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchStudentsOwing(), fetchTemplates()]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const isFormValid = checkFormValidity();
    setIsSubmitDisabled(!isFormValid);
  }, [messageData, selectedStudentsOwing]);

  const fetchStudentsOwing = async () => {
    try {
      const response = await axios.get("/api/students/getstudentsowing");
      setStudentsOwing(
        response.data.map((student) => ({
          value: student.user_id,
          label: `${student.name} - ${student.class_name} - ${student.phone} - ${student.amountowed}`,
          phone: student.phone,
          name: student.name,
          amount: student.amountowed, // Add amount to student data
        }))
      );
    } catch (error) {
      console.error("Error fetching students owing:", error);
    }
  };

  const fetchTemplates = async () => {
    // Replace with your actual templates
    const data = [
      {
        id: 3,
        name: "Fee Reminder (Professional)",
        content:
          "Dear Parent, this is a reminder that school fees for {name} are overdue. Kindly settle the outstanding balance of GHS {amount} before [Date] to avoid disruption of academic services.",
      },
      {
        id: 4,
        name: "Fee Reminder (Urgent)",
        content:
          "Attention Parent: School fees for {name} are past due. Kindly clear the GHS {amount} balance by [Date] to prevent academic service suspension.",
      },
    ];
    setTemplates(data);
  };

  const handleChange = (e) => {
    setIsLoading(false);
    const { name, value } = e.target;
    setMessageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTemplateChange = (e) => {
    const templateId = parseInt(e.target.value);
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      setMessageData((prevData) => ({
        ...prevData,
        content: template.content,
      }));
    }
  };

  const checkFormValidity = () => {
    if (selectedStudentsOwing.length === 0) {
      return false;
    }
    if (!messageData.content) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting class form data:", formData);

    setIsModalOpen(true); // Open the modal instead of using window.confirm
  };

  const handleConfirm = async () => {
    // e.preventDefault();
    setIsModalOpen(false); // Close the modal

    setIsLoading(true);
    setProgress(0);
    setStatusMessage("");
    setSendingDetails({
      total: 0,
      successful: 0,
      failed: 0,
      invalidNumbers: [],
    });

    // Get the selected students' data with names and amounts
    const selectedStudentsData = studentsOwing.filter((student) =>
      selectedStudentsOwing.includes(student.value)
    );

    try {
      const requestData = {
        message: messageData.content,
        selectedStudentsData, // Send student data with names and amounts
        senderId: session?.user?.id,
      };

      const response = await axios.post(
        "/api/messaging/send-fee-reminder",
        requestData
      );

      const { total, successful, failed, invalidNumbers, error, details } =
        response.data;
      if (response.status >= 200 && response.status < 300) {
        setSendingDetails({
          total,
          successful,
          failed,
          invalidNumbers,
        });
        setProgress(100);

        if (successful === total) {
          setStatusMessage(
            `Fee reminders sent successfully to all ${total} recipients`
          );
        } else {
          setStatusMessage(`Fee reminders sent to ${successful}/${total}`);
        }
      } else {
        // Update UI to indicate error
        console.error("Error sending fee reminders:", error, details);
        setStatusMessage("Failed to send fee reminders.");
      }
    } catch (error) {
      console.error(error);
      setProgress(0);
      setStatusMessage("Failed to send fee reminders. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "send sms" to be on this page
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full z-102">
          <div className="relative">
            <div
              className="bg-cyan-600 h-1.5 absolute top-0 left-0 transition-all duration-500 ease-in-out"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 10px rgba(8, 145, 178, 0.7)",
              }}
            ></div>
            <div className="absolute top-2 left-0 w-full text-center text-xs text-cyan-700">
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                {statusMessage}
              </div>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        Compose Fee Reminder
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MultiSelectDropdown
            label="Select Students Owing"
            options={studentsOwing}
            selectedValues={selectedStudentsOwing}
            onChange={setSelectedStudentsOwing}
            placeholder="Choose students..."
            isRequired={true}
          />

          <SelectField
            label="Use Template"
            name="template"
            icon={<FaEnvelope />}
            value={selectedTemplate}
            onChange={handleTemplateChange}
            isReadOnly={isDetails}
            isDisAbled={isDetails}
            isRequired={false}
            options={[
              { value: "", label: "Select a template" },
              ...templates?.map((template) => ({
                value: template.id,
                label: template.name,
              })),
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <TextAreaField
            label="Message"
            name="content"
            value={messageData?.content}
            onChange={handleChange}
            isReadOnly={isDetails}
            maxLength={150}
            placeholder="Enter message content"
            displayCount={true}
          />
        </div>

        {isLoading && sendingDetails.total > 0 && (
          <div className="mt-4 bg-gray-100 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">Total Recipients:</span>{" "}
                {sendingDetails.total}
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span className="font-bold text-green-600">
                  Successful: {sendingDetails.successful}
                </span>
              </div>
              {sendingDetails.failed > 0 && (
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-500 mr-2" />
                  <span className="font-bold text-red-600">
                    Failed: {sendingDetails.failed}
                  </span>
                </div>
              )}
            </div>
            {sendingDetails.invalidNumbers.length > 0 && (
              <div className="mt-2 text-xs text-red-500">
                Invalid Numbers: {sendingDetails.invalidNumbers.join(", ")}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            className={`${
              isLoading || isSubmitDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-cyan-700 hover:bg-cyan-600"
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center`}
            type="submit"
            disabled={isLoading || isSubmitDisabled}
          >
            <FaPaperPlane className="mr-2" />
            {isLoading ? "Sending..." : "Send Fee Reminders"}
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={onClose}
            // disabled={isLoading}
          >
            Close
          </button>
        </div>
      </form>

      <InfoModal
        isOpen={isLoading && sendingDetails.total > 0 && isInfoModal}
        onClose={() => {
          setIsInfoModal(false);
        }}
        title={"Fee Reminder Info"}
        message={`Total: ${sendingDetails.total}, Successful: ${
          sendingDetails.successful
        }, Failed: ${sendingDetails.failed}, Invalid numbers: ${
          sendingDetails.invalidNumbers?.length || 0
        }`}
      />

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={ "Send Fee Reminder"}
        message={
            "Are you sure you want to send the message?"
        }
      />
    </div>
  );
};

export default FeeReminder;
