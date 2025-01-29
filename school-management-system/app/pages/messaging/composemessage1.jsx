// pages/dashboard/messaging/composemessage.jsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
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

const ComposeMessage = ({ onClose, onSend, isDetails = false }) => {
  const [messageData, setMessageData] = useState({
    message_type: "general",
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
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [validUsers, setValidUsers] = useState([]);
  const [validStaff, setValidStaff] = useState([]);
  const [validSuppliers, setValidSuppliers] = useState([]);
  const [validParents, setValidParents] = useState([]);
  const [invalidUsers, setInvalidUsers] = useState([]);
  const [invalidSuppliers, setInvalidSuppliers] = useState([]);
  const [invalidStaff, setInvalidStaff] = useState([]);
  const [invalidParents, setInvalidParents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [validStudents, setValidStudents] = useState([]);
  const [validStudentsInDebt, setValidStudentsInDebt] = useState([]);
  const [invalidStudents, setInvalidStudents] = useState([]);
  const [invalidStudentsInDebt, setInvalidStudentsInDebt] = useState([]);
  const [recipientsNotOnList, setRecipientsNotOnList] = useState([]);
  const [studentsInDebt, setStudentsInDebt] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedStudentsinDebt, setSelectedStudentsinDebt] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchStudents();
    fetchUsers();
    fetchStaff();
    fetchParents();
    fetchSuppliers();
    fetchStudentsOwing();
  }, []);

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone?.replace(/\s/g, ""));
  };

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

      {
        id: 3,
        name: "Fee Reminder(professional)",
        subject: "Reminder: {Fee Reminder}",
        content: `Dear Parent, this is a reminder that school fees for {Student Name} are overdue. Kindly settle the outstanding balance of GHS {Amount} before [Date] to avoid disruption of academic services.`,
      },
      {
        id: 4,
        name: "Fee Reminder(urgent)",
        subject: "Reminder: {Fee Reminder}",
        content: `Attention Parent: School fees for {Student Name} are past due. Kindly clear the GHS {Amount} balance by [Date] to prevent academic service suspension.`,
      },
      {
        id: 5,
        name: "Fee Reminder(Empathetic)",
        subject: "Reminder: {Fee Reminder}",
        content: `Attention Parent: School fees for {Student Name} are past due. Kindly clear the GHS {Amount} balance by [Date] to prevent academic service suspension.`,
      },
    ];
    setTemplates(data);
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/api/students/getstudentsinclassorder");

      const validStudentsList = [];
      const invalidStudentsList = [];

      const formattedStudents = response.data.map((student) => {
        const studentData = {
          value: student.user_id,
          label: `${student.name} - ${student.class}`,
          phone: student.phone,
          name: student.name,
        };

        if (isValidPhoneNumber(student.phone)) {
          validStudentsList.push(studentData);
        } else {
          invalidStudentsList.push(studentData);
        }

        return studentData;
      });

      setStudents(formattedStudents);
      setValidStudents(validStudentsList);
      setInvalidStudents(invalidStudentsList);

      return {
        validStudents: validStudentsList,
        invalidStudents: invalidStudentsList,
      };
    } catch (error) {
      console.error("Error fetching students:", error);
      return { validStudents: [], invalidStudents: [] };
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users/getuserswithnumbers");

      const validUsersList = [];
      const invalidUsersList = [];

      const formattedUsers = response.data.map((user) => {
        const userData = {
          value: user?.user_id,
          label: `${user?.user_name} - ${user?.role}`,
          phone: user?.telephone_number,
          name: user?.user_name,
          role: user?.role,
        };

        if (isValidPhoneNumber(user?.telephone_number)) {
          validUsersList.push(userData);
        } else {
          invalidUsersList.push(userData);
        }

        return userData;
      });
      setUsers(formattedUsers);
      setValidUsers(validUsersList);
      setInvalidUsers(invalidUsersList);

      return { validUsers: validUsersList, invalidUsers: invalidUsersList };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { validUsers: [], invalidUsers: [] };
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get("/api/staff/all");

      const validStaffList = [];
      const invalidStaffList = [];

      const formattedStaff = response.data.map((staff) => {
        const userData = {
          value: staff?.user_id,
          label: `${staff?.first_name} ${staff?.last_name} ${staff?.middle_name} - ${staff?.role}`,
          phone: staff?.phone_number,
          name: `${staff?.first_name} ${staff?.last_name} ${staff?.middle_name}`,
          role: staff?.role,
        };

        if (isValidPhoneNumber(staff?.phone_number)) {
          validStaffList.push(userData);
        } else {
          invalidStaffList.push(userData);
        }

        return userData;
      });
      setStaff(formattedStaff);
      setValidStaff(validStaffList);
      setInvalidStaff(invalidStaffList);

      return { validUsers: validStaffList, invalidUsers: invalidStaffList };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return { validUsers: [], invalidUsers: [] };
    }
  };

  const fetchParents = async () => {
    try {
      const response = await axios.get("/api/parents/getallparents");

      const validParentsList = [];
      const invalidParentsList = [];

      const formattedParents = response.data.map((parent) => {
        const userData = {
          value: parent?.user_id,
          label: `${parent?.last_name} ${parent?.other_names} - ${parent?.phone}`,
          phone: parent?.phone,
          name: `${parent?.other_names} ${parent?.last_name}`,
          role: "parent",
        };

        if (isValidPhoneNumber(parent?.phone)) {
          validParentsList.push(userData);
        } else {
          invalidParentsList.push(userData);
        }

        return userData;
      });
      setParents(formattedParents);
      setValidParents(validParentsList);
      setInvalidParents(invalidParentsList);

      return {
        validParents: validParentsList,
        invalidParents: invalidParentsList,
      };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return { validParents: [], invalidParents: [] };
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("/api/inventory/suppliers/get");

      const validSuppliersList = [];
      const invalidSuppliersList = [];

      const formattedSuppliers = response.data.map((supplier) => {
        const userData = {
          value: supplier?.supplier_id,
          label: `${supplier?.contact_name} ${supplier?.supplier_name} - ${supplier?.contact_phone}`,
          phone: supplier?.contact_phone,
          name: `${supplier?.contact_name} ${supplier?.supplier_name} `,
          role: "supplier",
        };

        if (isValidPhoneNumber(supplier?.contact_phone)) {
          validSuppliersList.push(userData);
        } else {
          invalidSuppliersList.push(userData);
        }

        return userData;
      });
      setSuppliers(formattedSuppliers);
      setValidSuppliers(validSuppliersList);
      setInvalidSuppliers(invalidSuppliersList);

      return {
        validSuppliers: validSuppliersList,
        invalidSuppliers: invalidSuppliersList,
      };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return { validSuppliers: [], invalidSuppliers: [] };
    }
  };

  const fetchStudentsOwing = async () => {
    try {
      const response = await axios.get("/api/students/getstudentsowing");

      const validStudentsinDebtList = [];
      const invalidStudentsinDebtList = [];

      const formattedSuppliers = response.data.map((student) => {
        const userData = {
          value: student.user_id,
          label: `${student.name} - ${student.class_name} - ${student.amountowed} - ${student?.phone}`,
          phone: student?.phone,
          name: student.name,
          amount: student.amountowed,
        };

        if (isValidPhoneNumber(student?.phone)) {
          validStudentsinDebtList.push(userData);
        } else {
          invalidStudentsinDebtList.push(userData);
        }

        return userData;
      });
      setStudentsInDebt(formattedSuppliers);
      setValidStudentsInDebt(validStudentsinDebtList);
      setInvalidStudentsInDebt(invalidStudentsinDebtList);

      return {
        validStudentsInDebt: validStudentsinDebtList,
        invalidStudentsInDebt: invalidStudentsinDebtList,
      };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return { validStudentsInDebt: [], invalidStudentsInDebt: [] };
    }
  };

  const handleChange = (e) => {
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
        subject: template.subject,
        content: template.content,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setProgress(0);
    setStatusMessage("");
    setSendingDetails({
      total: 0,
      successful: 0,
      failed: 0,
      invalidNumbers: [],
    });

    let recipientsData = [];

    if (messageData?.recipients === "students") {
      recipientsData = validStudents.filter((student) =>
        selectedStudents.includes(student?.value)
      );
    } else if (messageData?.recipients === "users") {
      recipientsData = validUsers.filter((user) =>
        selectedUsers.includes(user?.value)
      );
    } else if (messageData?.recipients === "staff") {
      recipientsData = validStaff.filter((staff) =>
        selectedStaff.includes(staff?.value)
      );
    } else if (messageData?.recipients === "parents") {
      recipientsData = validParents.filter((parent) =>
        selectedParents.includes(parent?.value)
      );
    } else if (messageData?.recipients === "suppliers") {
      recipientsData = validSuppliers?.filter((supplier) =>
        selectedSuppliers.includes(supplier?.value)
      );
    } else if (messageData?.recipients === "students owing") {
      recipientsData = validStudentsInDebt?.filter((studentInDebt) =>
        selectedStudentsinDebt.includes(studentInDebt?.value)
      );
    } else if (messageData?.recipients === "others" && messageData.others) {
      const otherNumbers = messageData.others
        .split(",")
        .map((phone) => phone.trim());
      recipientsData = otherNumbers.map((phone) => ({ phone }));
    }

    try {
      const totalRecipients = recipientsData.length || 1;

      const messagesToSend = recipientsData.map((recipient) => {
        let messageContent = messageData?.content;

        if (messageData?.recipients === "students owing") {
          messageContent = messageContent
            .replace(/\{Student Name\}/g, recipient.name)
            .replace(/\{Amount\}/g, recipient.amount);
        } else if (
          messageData?.recipients === "students" ||
          messageData?.recipients === "parents"
        ) {
          messageContent = messageContent.replace(/\{name\}/g, recipient.name);
        }

        return {
          message: messageContent,
          recipient: recipient.phone,
        };
      });

      const responses = await Promise.all(
        messagesToSend.map(async (messageData) => {
          try {
            const response = await axios.post("/api/messaging/send-message", {
              message: messageData.message,
              recipients: [messageData.recipient],
            });
            return response.data;
          } catch (error) {
            console.error(
              "Error sending message to",
              messageData.recipient,
              error
            );
            return {
              arkeselResponse: {
                data: [
                  {
                    recipient: messageData.recipient,
                    id: null,
                    error: "Failed to send",
                  },
                ],
              },
            };
          }
        })
      );

      let successfulRecipients = 0;
      let failedRecipients = 0;
      let invalidNumbers = [];

      responses.forEach((response) => {
        const arkeselData = response.arkeselResponse.data;
        arkeselData.forEach((item) => {
          if (item.recipient && item.id) {
            successfulRecipients++;
          } else {
            failedRecipients++;
            if (item["invalid numbers"]) {
              invalidNumbers = invalidNumbers.concat(item["invalid numbers"]);
            }
          }
        });
      });

      const sendingStatus = {
        total: totalRecipients,
        successful: successfulRecipients,
        failed: failedRecipients,
        invalidNumbers: invalidNumbers,
      };

      setSendingDetails(sendingStatus);

      setProgress(100);

      if (sendingStatus.successful === totalRecipients) {
        setStatusMessage(
          `Message sent successfully to all ${totalRecipients} recipients`
        );
      } else {
        setStatusMessage(
          `Sent to ${sendingStatus.successful}/${totalRecipients} recipients`
        );
      }
    } catch (error) {
      console.error(error);

      setProgress(0);
      setStatusMessage("Failed to send message. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
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
              label="Message Type"
              name="message_type"
              icon={<FaEnvelope />}
              value={messageData?.message_type}
              onChange={handleChange}
              isReadOnly={isDetails}
              isDisAbled={isDetails}
              isRequired={true}
              options={[
                { value: "", label: "Select message category" },
                { value: "general", label: "General" },
                { value: "fee_reminder", label: "Fee Reminder" },
              ]}
            />
            {messageData?.message_type === "fee_reminder" && (
              <>
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
                    { value: "students owing", label: "Students Owing" },
                  ]}
                />

                {messageData.recipients === "students owing" && (
                  <MultiSelectDropdown
                    label="Select students owing"
                    options={studentsInDebt}
                    selectedValues={selectedStudentsinDebt}
                    onChange={setSelectedStudentsinDebt}
                    placeholder="Choose students owing..."
                    isRequired={true}
                  />
                )}
              </>
            )}

            {messageData?.message_type === "general" && (
              <>
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
                    { value: "users", label: "Users" },
                    { value: "students", label: "Students" },
                    { value: "staff", label: "Staff" },
                    { value: "parents", label: "Parents" },
                    { value: "suppliers", label: "Suppliers" },
                    { value: "others", label: "Others" },
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
              </>
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
            maxLength={160}
            placeholder="Enter message content"
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
              className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              type="submit"
              disabled={isLoading}
            >
              <FaPaperPlane className="mr-2" />
              {isLoading ? "Sending..." : "Broadcast Message"}
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <InfoModal
        isOpen={isLoading && sendingDetails.total > 0}
        onClose={() => {
          setIsLoading(false);
        }}
        title={"SMS Info"}
        message={` total: ${
          (messageData?.recipients === "users" && selectedUsers?.length) ||
          (messageData?.recipients === "staff" && selectedStaff?.length) ||
          (messageData?.recipients === "parents" && selectedParents?.length) ||
          (messageData?.recipients === "students owing" &&
            selectedStudentsinDebt?.length) ||
          (messageData?.recipients === "suppliers" &&
            selectedSuppliers?.length) ||
          (messageData?.recipients === "students" &&
            selectedStudents?.length) ||
          sendingDetails?.total
        }, successful: ${sendingDetails?.successful},  invalid numbers: ${
          (messageData?.recipients === "users" && invalidUsers?.length) ||
          (messageData?.recipients === "staff" && invalidStaff?.length) ||
          (messageData?.recipients === "parents" && invalidParents?.length) ||
          (messageData?.recipients === "students" && invalidStudents?.length) ||
          (messageData?.recipients === "students owing" &&
            invalidStudentsInDebt?.length) ||
          (messageData?.recipients === "suppliers" &&
            invalidSuppliers?.length) ||
          (messageData?.recipients === "others" &&
            sendingDetails?.invalidNumbers) ||
          0
        }`}
      />
    </>
  );
};

// {"data":[{"id":"5e16e12d-7526-41de-abb9-3c4630585989","recipient":"233551577446"},{"id":"6acd6a2f-9903-4e92-a5b6-3b291beeaf7c","recipient":"233547323204"},{"id":"1dd69746-83e0-4158-8c4a-c102508541b9","recipient":"233509671435"}],"status":"success"}

export default ComposeMessage;
