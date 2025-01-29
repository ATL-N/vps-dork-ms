// pages/dashboard/messaging/composemessage.jsx
import React, { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaPaperPlane,
  FaFileAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import {
  TextAreaField,
  SelectField,
  InputField,
  MultiSelectDropdown,
} from "../../components/inputFieldSelectField";
import InfoModal from "../../components/modal/infoModal";
import { useSession } from "next-auth/react";
import ConfirmModal from "../../components/modal/confirmModal";


const ComposeMessage = ({ onClose, onSend, isDetails = false }) => {
  const { data: session, status } = useSession();
  const [messageData, setMessageData] = useState({
    recipients: "",
    subject: "",
    others: "",
    content: "",
  });
  const [sendingDetails, setSendingDetails] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    invalidNumbers: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoModal, setIsInfoModal] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // State for submit button

  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
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
      await Promise.all([
        fetchTemplates(),
        fetchStudents(),
        fetchUsers(),
        fetchStaff(),
        fetchParents(),
        fetchSuppliers(),
      ]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Check form validity whenever messageData changes
    const isFormValid = checkFormValidity();
    setIsSubmitDisabled(!isFormValid);
  }, [
    messageData,
    selectedStudents,
    selectedUsers,
    selectedStaff,
    selectedParents,
    selectedSuppliers,
  ]);

  const fetchTemplates = async () => {
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
    ];
    setTemplates(data);
  };

  const fetchData = async (apiEndpoint, type) => {
    try {
      const response = await axios.get(apiEndpoint);

      switch (type) {
        case "students":
          setStudents(
            response.data.map((student) => ({
              value: student.user_id,
              label: `${student.name} - ${student.class} - ${student.phone}`,
              phone: student.phone,
              name: student.name,
            }))
          );

          break;
        case "users":
          setUsers(
            response.data.map((user) => ({
              value: user?.user_id,
              label: `${user?.user_name} - ${user?.role} - ${user?.telephone_number}`,
              phone: user?.telephone_number,
              name: user?.user_name,
              role: user?.role,
            }))
          );

          break;
        case "staff":
          setStaff(
            response.data.map((staff) => ({
              value: staff?.user_id,
              label: `${staff?.first_name} ${staff?.last_name} ${staff?.middle_name} - ${staff?.role} - ${staff?.phone_number}`,
              phone: staff?.phone_number,
              name: `${staff?.first_name} ${staff?.last_name} ${staff?.middle_name}`,
              role: staff?.role,
            }))
          );

          break;
        case "parents":
          setParents(
            response.data.map((parent) => ({
              value: parent?.user_id,
              label: `${parent?.last_name} ${parent?.other_names} - ${parent?.phone}`,
              phone: parent?.phone,
              name: `${parent?.other_names} ${parent?.last_name}`,
              role: "parent",
            }))
          );

          break;
        case "suppliers":
          setSuppliers(
            response.data.map((supplier) => ({
              value: supplier?.supplier_id,
              label: `${supplier?.contact_name} ${supplier?.supplier_name} - ${supplier?.contact_phone}`,
              phone: supplier?.contact_phone,
              name: `${supplier?.contact_name} ${supplier?.supplier_name} `,
              role: "supplier",
            }))
          );

          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  const fetchStudents = async () =>
    fetchData("/api/students/getstudentsinclassorder", "students");
  const fetchUsers = async () =>
    fetchData("/api/users/getuserswithnumbers", "users");
  const fetchStaff = async () => fetchData("/api/staff/all", "staff");
  const fetchParents = async () =>
    fetchData("/api/parents/getallparents", "parents");
  const fetchSuppliers = async () =>
    fetchData("/api/inventory/suppliers/get", "suppliers");

  const handleChange = (e) => {
    setIsLoading(false);
    const { name, value } = e.target;
    setMessageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTemplateChange = (e) => {
    setIsLoading(false)
    const templateId = parseInt(e.target.value);
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      setMessageData((prevData) => ({
        ...prevData,
        subject: template.subject,
        content: template.content,
      }));
    }
  };

  const checkFormValidity = () => {
    if (!messageData.recipients) {
      return false;
    }

    if (messageData.recipients === "others" && !messageData.others) {
      return false;
    }

    if (
      messageData.recipients === "students" &&
      selectedStudents.length === 0
    ) {
      return false;
    }

    if (messageData.recipients === "users" && selectedUsers.length === 0) {
      return false;
    }
    if (messageData.recipients === "staff" && selectedStaff.length === 0) {
      return false;
    }

    if (messageData.recipients === "parents" && selectedParents.length === 0) {
      return false;
    }
    if (
      messageData.recipients === "suppliers" &&
      selectedSuppliers.length === 0
    ) {
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

    let recipients = [];
    let recipientIds = [];

    let selectedData = [];

    switch (messageData?.recipients) {
      case "students":
        selectedData = students.filter((student) =>
          selectedStudents.includes(student?.value)
        );
        break;
      case "users":
        selectedData = users.filter((user) =>
          selectedUsers.includes(user?.value)
        );
        break;
      case "staff":
        selectedData = staff.filter((staff) =>
          selectedStaff.includes(staff?.value)
        );
        break;
      case "parents":
        selectedData = parents.filter((parent) =>
          selectedParents.includes(parent?.value)
        );
        break;
      case "suppliers":
        selectedData = suppliers.filter((supplier) =>
          selectedSuppliers.includes(supplier?.value)
        );
        break;
      case "others":
        if (messageData.others) {
          recipients = messageData.others
            .split(",")
            .map((phone) => phone.trim());
        }
        break;
      default:
        break;
    }

    if (messageData?.recipients !== "others") {
      recipients = selectedData.map((item) => item.phone);
      recipientIds = selectedData.map((item) => item.value);
    }

    try {
      // Prepare data for the API request
      const requestData = {
        message: messageData?.content,
        recipients: recipients,
        recipientType: messageData?.recipients,
        recipientIds: recipientIds,
        senderId: session?.user?.id,
      };

      const response = await axios.post(
        "/api/messaging/send-message",
        requestData
      );

      const { total, successful, failed, invalidNumbers, smsLogId } =
        response.data;

      setSendingDetails({
        total: total,
        successful: successful,
        failed: failed,
        invalidNumbers: invalidNumbers,
      });

      setProgress(100);

      if (successful === total) {
        setStatusMessage(
          `Message sent successfully to all ${total} recipients`
        );
      } else {
        setStatusMessage(`Sent to ${successful}/${total} recipients`);
      }
    } catch (error) {
      console.error(error);
      setProgress(0);
      setStatusMessage("Failed to send message. Please try again.");
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
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={"Send SMS"}
        message={
           "Are you sure you want to send the message?"
        }
      />

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
          Compose Message
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SelectField
              label="Recipients"
              name="recipients"
              icon={<FaEnvelope />}
              value={messageData?.recipients}
              onChange={handleChange}
              isReadOnly={isDetails}
              isDisAbled={isDetails}
              isRequired={true}
              options={[
                { value: "", label: "Select recipient group" },
                // { value: "users", label: "Users" },
                { value: "students", label: "Students" },
                { value: "staff", label: "Staff" },
                { value: "parents", label: "Parents" },
                { value: "suppliers", label: "Suppliers" },
                // { value: "others", label: "Others" },
              ]}
            />

            {messageData.recipients === "suppliers" && (
              <MultiSelectDropdown
                label="Select suppliers"
                options={suppliers}
                selectedValues={selectedSuppliers}
                onChange={setSelectedSuppliers}
                placeholder="Choose suppliers..."
                isRequired={true}
              />
            )}

            {messageData.recipients === "students" && (
              <MultiSelectDropdown
                label="Select Students"
                options={students}
                selectedValues={selectedStudents}
                onChange={setSelectedStudents}
                placeholder="Choose students..."
                isRequired={true}
              />
            )}

            {messageData.recipients === "users" && (
              <MultiSelectDropdown
                label="Select Users"
                options={users}
                selectedValues={selectedUsers}
                onChange={setSelectedUsers}
                placeholder="Choose users..."
                isRequired={true}
              />
            )}

            {messageData.recipients === "staff" && (
              <MultiSelectDropdown
                label="Select staff"
                options={staff}
                selectedValues={selectedStaff}
                onChange={setSelectedStaff}
                placeholder="Choose staff..."
                isRequired={true}
              />
            )}

            {messageData.recipients === "parents" && (
              <MultiSelectDropdown
                label="Select parents"
                options={parents}
                selectedValues={selectedParents}
                onChange={setSelectedParents}
                placeholder="Choose parents..."
                isRequired={true}
              />
            )}

            {messageData.recipients === "others" && (
              <InputField
                label="Others Numbers "
                name="others"
                type="text"
                icon={<FaFileAlt />}
                value={messageData?.others}
                placeholder={"eg. 02000000000, 233540235697"}
                title="separate the numbers with comma. Eg. 0200000000, +233540235697,"
                onChange={handleChange}
                isReadOnly={isDetails}
                isRequired={true}
              />
            )}

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
          <TextAreaField
            label="Message"
            name="content"
            value={messageData?.content}
            onChange={handleChange}
            isReadOnly={isDetails}
            displayCount={true}
            maxLength={160}
            placeholder="Enter message content..."
          />

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
              {isLoading ? "Sending..." : "Broadcast Message"}
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
      </div>

      <InfoModal
        isOpen={isLoading && sendingDetails.total > 0 && isInfoModal}
        onClose={() => {
          setIsInfoModal(false);
          // setIsLoading(false);
        }}
        title={"SMS Info"}
        message={` total: ${sendingDetails.total}, successful: ${
          sendingDetails.successful
        }, failed: ${sendingDetails.failed},  invalid numbers: ${
          sendingDetails.invalidNumbers?.length || 0
        }`}
      />
    </>
  );
};

export default ComposeMessage;
