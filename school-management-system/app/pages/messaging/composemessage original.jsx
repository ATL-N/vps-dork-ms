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

  // const user = process.env.DB_USER;

  // console.log("user", user);

  useEffect(() => {
    fetchTemplates();
    fetchStudents();
    fetchUsers();
    fetchStaff();
    fetchParents();
    fetchSuppliers();
    fetchStudentsOwing();
  }, []);

  // Helper function to validate phone number
  const isValidPhoneNumber = (phone) => {
    // Regex for international phone number formats
    // This is a basic validation and can be adjusted based on specific requirements
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone?.replace(/\s/g, ""));
  };

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
      // Add more template data as needed
    ];
    setTemplates(data);
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/api/students/getstudentsinclassorder");

      // Separate valid and invalid students
      const validStudentsList = [];
      const invalidStudentsList = [];

      const formattedStudents = response.data.map((student) => {
        const studentData = {
          value: student.user_id,
          label: `${student.name} - ${student.class}`,
          phone: student.phone,
          name: student.name,
        };

        // Check phone number validity
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

      // Separate valid and invalid users
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

        // Check phone number validity
        if (isValidPhoneNumber(user?.telephone_number)) {
          validUsersList.push(userData);
        } else {
          invalidUsersList.push(userData);
        }

        return userData;
      });
      console.log("formattedUsers", invalidUsersList);
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

      // Separate valid and invalid users
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

        // Check phone number validity
        if (isValidPhoneNumber(staff?.phone_number)) {
          validStaffList.push(userData);
        } else {
          invalidStaffList.push(userData);
        }

        return userData;
      });
      console.log("formattedStaff", invalidStaffList);
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

      // Separate valid and invalid users
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

        // Check phone number validity
        if (isValidPhoneNumber(parent?.phone)) {
          validParentsList.push(userData);
        } else {
          invalidParentsList.push(userData);
        }

        return userData;
      });
      console.log("formattedParents", invalidParentsList);
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

      // Separate valid and invalid users
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

        // Check phone number validity
        if (isValidPhoneNumber(supplier?.contact_phone)) {
          validSuppliersList.push(userData);
        } else {
          invalidSuppliersList.push(userData);
        }

        return userData;
      });
      console.log("formattedSuppliers", invalidSuppliersList);
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

      // Separate valid and invalid users
      const validStudentsinDebtList = [];
      const invalidStudentsinDebtList = [];

      const formattedSuppliers = response.data.map((student) => {
        const userData = {
          value: student.user_id,
          label: `${student.name} - ${student.class_name} - ${student.amountowed} - ${student?.phone}`,
          phone: student?.phone,
          name: student.name,
        };

        // Check phone number validity
        if (isValidPhoneNumber(student?.phone)) {
          validStudentsinDebtList.push(userData);
        } else {
          invalidStudentsinDebtList.push(userData);
        }

        return userData;
      });
      console.log("formattedSuppliers", invalidStudentsinDebtList);
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
    // console.log('messageData', messageData)
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("handle submit function");
  //   const data = {
  //     sender: "ATL Trying",
  //     message: "Nelson's Second message text here",
  //     recipients: ["0551577446", '0547323204'],
  //     sandbox: true,
  //   };

  //   const config = {
  //     method: "post",
  //     url: "https://sms.arkesel.com/api/v2/sms/send",
  //     headers: {
  //       "api-key": "Q3pCaFNaSWJFQ2RyRE5GZHRvUEw",  // Q3pCaFNaSWJFQ2RyRE5GZHRvUEw
  //     },
  //     data: data,
  //   };

  //   try {
  //     const response = await axios(config);
  //     console.log(JSON.stringify(response.data));
  //     // Handle successful SMS send (e.g., show success message)
  //     onClose();
  //   } catch (error) {
  //     console.error(error);
  //     // Handle error (e.g., show error message)
  //   }
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   let recipients = [];
  //   let successfulRecipients = [];
  //   let failedRecipients = [];

  //   if (messageData?.recipients === "students") {
  //     const selectedStudentsData = validStudents.filter((student) =>
  //       selectedStudents.includes(student?.value)
  //     );
  //     // recipients = selectedStudentsData.map((student) => student.phone);
  //   }

  //   try {
  //     // Send SMS to valid recipients
  //     const response = await axios.post("/api/messaging/send-message", {
  //       message: messageData?.content,
  //       recipients: ['0551577446'],
  //     });

  //     // Track successful and failed recipients
  //     if (response.data.successful) {
  //       successfulRecipients = response.data.successful;
  //       failedRecipients = response.data.failed || [];
  //     }

  //     // Store messaging history
  //     // await axios.post("/api/messaging/log", {
  //     //   messageType: messageData.message_type,
  //     //   content: messageData.content,
  //     //   successfulRecipients,
  //     //   failedRecipients,
  //     //   invalidRecipients: invalidStudents.map((student) => student.phone),
  //     // });

  //     onClose();
  //   } catch (error) {
  //     console.error(error);
  //     // Handle error (e.g., show error message)
  //   }
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   let recipients = [];
  //   if (messageData?.recipients === "students") {
  //     const selectedStudentsData = students.filter((student) =>
  //       selectedStudents.includes(student?.value)
  //     );
  //     recipients = selectedStudentsData.map((student) => student.phone);
  //   }

  //   try {
  //     const response = await axios.post("/api/messaging/send-message", {
  //       message: messageData?.content,
  //       recipients,
  //     });
  //     console.log(response.data);
  //     onClose();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   let recipients = [];
  //   let successfulRecipients = [];
  //   let failedRecipients = [];

  //   // Determine recipients based on selection
  //   if (messageData?.recipients === "students") {
  //     const selectedStudentsData = validStudents.filter((student) =>
  //       selectedStudents.includes(student?.value)
  //     );
  //     recipients = selectedStudentsData.map((student) => student.phone);
  //   } else if (messageData?.recipients === "Others" && messageData.others) {
  //     // Split and trim phone numbers if "Others" is selected
  //     recipients = messageData.others.split(",").map((phone) => phone.trim());
  //   }

  //   try {
  //     // Send SMS to valid recipients
  //     const response = await axios.post("/api/messaging/send-message", {
  //       message: messageData?.content,
  //       recipients: recipients.length > 0 ? recipients : undefined, // Use undefined to trigger default
  //     });

  //     // Extract successful and failed recipients from response
  //     successfulRecipients = response.data.successful || [];
  //     failedRecipients = response.data.failed || [];

  //     // // Store messaging history (uncomment when backend endpoint is ready)
  //     // await axios.post("/api/messaging/log", {
  //     //   messageType: messageData.message_type,
  //     //   content: messageData.content,
  //     //   successfulRecipients,
  //     //   failedRecipients,
  //     //   invalidRecipients: invalidStudents.map((student) => student.phone),
  //     // });

  //     // Optional: Show success message
  //     alert(
  //       `Message sent successfully to ${successfulRecipients.length} recipients`
  //     );

  //     onClose();
  //   } catch (error) {
  //     console.error(error);
  //     // Show error message
  //     alert("Failed to send message. Please try again.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset loading states
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

    // Determine recipients based on selection
    if (messageData?.recipients === "students") {
      const selectedStudentsData = validStudents.filter((student) =>
        selectedStudents.includes(student?.value)
      );
      recipients = selectedStudentsData.map((student) => student.phone);
    } else if (messageData?.recipients === "users") {
      const selectedUsersData = validUsers.filter((user) =>
        selectedUsers.includes(user?.value)
      );
      recipients = selectedUsersData.map((user) => user.phone);
    } else if (messageData?.recipients === "staff") {
      const selectedStaffData = validStaff.filter((staff) =>
        selectedStaff.includes(staff?.value)
      );
      recipients = selectedStaffData.map((staff) => staff?.phone);
    } else if (messageData?.recipients === "parents") {
      const selectedParentsData = validParents.filter((parent) =>
        selectedParents.includes(parent?.value)
      );
      recipients = selectedParentsData.map((parent) => parent?.phone);
    } else if (messageData?.recipients === "suppliers") {
      const selectedSuppliersData = validSuppliers?.filter((supplier) =>
        selectedSuppliers.includes(supplier?.value)
      );
      recipients = selectedSuppliersData.map((supplier) => supplier?.phone);
    } else if (messageData?.recipients === "students owing") {
      const selectedStudentsinDebtData = validStudentsInDebt?.filter((studentInDebt) =>
        selectedStudentsinDebt.includes(studentInDebt?.value)
      );
      recipients = selectedStudentsinDebtData.map(
        (studentInDebt) => studentInDebt?.phone
      );
      console.log("students owing: ", recipients);
    } else if (messageData?.recipients === "others" && messageData.others) {
      // Split and trim phone numbers if "Others" is selected
      recipients = messageData.others.split(",").map((phone) => phone.trim());
      // console.log("recipients for others", recipients);
    }

    try {
      // Total recipients for progress tracking
      const totalRecipients = recipients.length || 1;

      // Send SMS to valid recipients
      const response = await axios.post("/api/messaging/send-message", {
        message: messageData?.content,
        recipients: recipients.length > 0 ? recipients : undefined,
      });

      // Parse the Arkesel API response
      const arkeselData = response.data;
      console.log("arkeselData", arkeselData.arkeselResponse.data);

      // Analyze sending status
      const successfulRecipients = arkeselData.arkeselResponse.data.filter(
        (item) => item.recipient && item.id
      );

      const invalidNumbers =
        arkeselData.arkeselResponse.data.find(
          (item) => item["invalid numbers"]
        )?.["invalid numbers"] || [];

      // Update sending details
      const sendingStatus = {
        total: totalRecipients,
        successful: successfulRecipients.length,
        failed: totalRecipients - successfulRecipients.length,
        invalidNumbers: invalidNumbers,
      };

      setSendingDetails(sendingStatus);

      // Update progress
      setProgress(100);

      // Set status message
      if (sendingStatus.successful === totalRecipients) {
        setStatusMessage(
          `Message sent successfully to all ${totalRecipients} recipients`
        );
      } else {
        setStatusMessage(
          `Sent to ${sendingStatus.successful}/${totalRecipients} recipients`
        );
      }

      // Close the modal after a short delay
      //  setTimeout(() => {
      //    setIsLoading(false);
      //    onClose();
      //  }, 2000);
    } catch (error) {
      console.error(error);

      // Error handling
      setProgress(0);
      setStatusMessage("Failed to send message. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg">
        {/* Elevated Progress Bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full z-102">
            <div className="relative">
              <div
                className="bg-cyan-600 h-1.5 absolute top-0 left-0 transition-all duration-500 ease-in-out"
                style={{
                  width: `${progress}%`,
                  boxShadow: "0 0 10px rgba(8, 145, 178, 0.7)", // Subtle glow effect
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
          {process.env.DB_USER}Compose Message
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
                // { value: "B+", label: "B+" },
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
                    // { value: "class specific", label: "Class Specific" },
                    // { value: "parents", label: "All Parents" },
                    // { value: "B+", label: "B+" },
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
                    // { value: "students", label: "All Students" },
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
                // { value: "general", label: "General" },
                // { value: "fee_reminder", label: "Fee Reminder" },
                // { value: "B+", label: "B+" },
              ]}
            />
          </div>
          <TextAreaField
            label="Message"
            name="content"
            // icon={<FaPaperPlane className="text-gray-400" />}
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
          // onClose();
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

// faild: ${sendingDetails?.failed},
export default ComposeMessage;
