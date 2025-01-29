// pages/dashboard/messaging/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaInbox,
  FaPaperPlane,
  FaBullhorn,
  FaEnvelopeOpenText,
  FaRegBell,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import ComposeMessage from "./composemessage";
import SentMessagesLog from "./sentmessageslog";
import MessageDetails from "./messagedetails";
import FeeReminder from "./feereminder";
import CustomTable from "../../components/listtableForm";
import Loadingpage from "../../components/Loadingpage";
import { fetchData } from "../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";

const MessagingCommunication = () => {
  const { data: session, status } = useSession();

  const [searchQuery, setSearchQuery] = useState("");

  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["view sms"];

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
    // toast.success("loading teachers");
    setIsLoading(true);
    fetchSms();
    setIsLoading(false);

    // fetchTeacherStats();
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSms(searchQuery);
  };

  const fetchSms = async (searchQuery1 = "") => {
    // const toastId = toast.loading("Fetching staff...");

    try {
      let url = "/api/messaging/fetchallmessages";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const data = await fetchData(url, "", false);
      console.log("data for messages", data);
      // function extractData(data) {
      //   return data.map((staff) => ({
      //     id: staff.id,
      //     name: staff.name,
      //     gender: staff.gender,
      //     phone_number: staff.phone_number,
      //     email: staff.email,
      //     role: staff.role,
      //   }));
      // }

      // setStaff(extractData(data?.staff));
      setMessages(data);

      return data;
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const dummyMessages = [
    {
      id: 1,
      recipient_type: "Students",
      message_content: "Reminder: School fees are due next week.",
      total_attempeted: 50,
      total_invalid_numbers: 2,
      total_successful: 45,
      total_failed: 3,
      send_timestamp: "2024-03-15T08:30:00Z",
    },
    {
      id: 2,
      recipient_type: "Parents",
      message_content: "PTA meeting scheduled for this Saturday at 10:00 AM.",
      total_attempeted: 120,
      total_invalid_numbers: 5,
      total_successful: 110,
      total_failed: 5,
      send_timestamp: "2024-03-12T14:15:00Z",
    },
    {
      id: 3,
      recipient_type: "Staff",
      message_content:
        "Staff meeting tomorrow at 9:00 AM in the conference room.",
      total_attempeted: 30,
      total_invalid_numbers: 0,
      total_successful: 30,
      total_failed: 0,
      send_timestamp: "2024-03-10T16:45:00Z",
    },
    {
      id: 4,
      recipient_type: "Suppliers",
      message_content:
        "New order request: Please prepare the following items...",
      total_attempeted: 15,
      total_invalid_numbers: 1,
      total_successful: 13,
      total_failed: 1,
      send_timestamp: "2024-03-08T11:00:00Z",
    },
    {
      id: 5,
      recipient_type: "Students",
      message_content: "Congratulations to the winners of the science fair!",
      total_attempeted: 45,
      total_invalid_numbers: 3,
      total_successful: 40,
      total_failed: 2,
      send_timestamp: "2024-03-05T09:20:00Z",
    },
    {
      id: 6,
      recipient_type: "Parents",
      message_content:
        "Parent-teacher conferences will be held next week. Please sign up for a slot.",
      total_attempeted: 110,
      total_invalid_numbers: 2,
      total_successful: 105,
      total_failed: 3,
      send_timestamp: "2024-03-02T13:30:00Z",
    },
    {
      id: 7,
      recipient_type: "Staff",
      message_content: "Reminder: Professional development workshop on Friday.",
      total_attempeted: 25,
      total_invalid_numbers: 0,
      total_successful: 25,
      total_failed: 0,
      send_timestamp: "2024-02-28T10:00:00Z",
    },
    {
      id: 8,
      recipient_type: "Others",
      message_content: "Test message to other recipients.",
      total_attempeted: 5,
      total_invalid_numbers: 0,
      total_successful: 4,
      total_failed: 1,
      send_timestamp: "2024-02-26T15:55:00Z",
    },
  ];

  const headerNames = [
    "id",
    "Recipient Type",
    "Message",
    "Attempted",
    "Invalid",
    "Successful",
    "Failed",
    "Total SMS Used",
    "Timestamp",
    // "Status",
  ];

  // useEffect(() => {
  //   fetchMessages();
  // }, []);

  // const fetchMessages = async () => {
  //   // Replace with actual API call to fetch SMS logs
  //   const data = [
  //     {
  //       id: 1,
  //       recipient_type: "students",
  //       message_content: "Reminder: School fees are due next week.",
  //       total_attempeted: 50,
  //       total_invalid_numbers: 2,
  //       total_successful: 45,
  //       total_failed: 3,
  //       send_timestamp: "2024-07-25T10:30:00Z",
  //     },
  //     {
  //       id: 2,
  //       recipient_type: "parents",
  //       message_content:
  //         "PTA meeting scheduled for this Saturday at 10:00 AM.",
  //       total_attempeted: 120,
  //       total_invalid_numbers: 5,
  //       total_successful: 110,
  //       total_failed: 5,
  //       send_timestamp: "2024-07-24T14:15:00Z",
  //     },
  //     // Add more message data as needed
  //   ];
  //   setMessages(data);
  // };

  const handleComposeMessage = () => {
    setModalContent(
      <ComposeMessage
        onClose={() => {
          setShowModal(false);
          fetchSms();
        }}
        onSend={(messageData) => {
          console.log("Sending message:", messageData);
          // fetchMessages();
        }}
      />
    );
    setShowModal(true);
  };

  const handleComposeFeeReminder = () => {
    setModalContent(
      <FeeReminder
        onClose={() => {
          setShowModal(false);
          fetchSms();
        }}
        onSend={(messageData) => {
          console.log("Sending message:", messageData);
          // fetchMessages();
        }}
      />
    );
    setShowModal(true);
  };

  const handleViewDetails = (log) => {
    console.log("logs:", log);
    setSelectedLog(log);
    const filterSmsLogById = (logs, id) => {
      if (!logs || !Array.isArray(logs)) {
        return null; // Or throw an error, depending on your needs
      }

      const filteredLog = logs.find((log) => log.id === id);

      return filteredLog || null; // Return null if no matching log is found
    };
    const selectedSMS = filterSmsLogById(messages, log);
    console.log("selectedSMS", selectedSMS);
    setModalContent(
      <MessageDetails id={log} onClose={() => setShowModal(false)} />
    );
    setShowModal(true);
  };

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "view sms" to be on this page
      </div>
    );
  }

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Messaging & Communication
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaInbox />}
          title="Total Recipients"
          value={messages?.totalRecipients || 0}
        />
        <StatCard
          icon={<FaInbox />}
          title="Total Successful Sms"
          value={messages?.totalSuccessfulMessages}
        />
        <StatCard
          icon={<FaRegBell />}
          title="Total SMS Used"
          value={messages?.totalSmsSent || 0}
        />
        {/* <StatCard
          icon={<FaPaperPlane />}
          title="Failed Messages"
          value={25} // Replace with actual data
        /> */}
        <StatCard
          icon={<FaBullhorn />}
          title="Invalid Numbers"
          value={messages?.totalInvalidNumbers} // Replace with actual data
        />
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            Sent Messages Log
          </h2>
          <div className="flex">
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "send sms"
              )) && (
              <button
                onClick={handleComposeMessage}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
              >
                <FaPaperPlane className="mr-2" /> General Message
              </button>
            )}
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "send sms"
              )) && (
              <button
                onClick={handleComposeFeeReminder}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-0"
              >
                <FaPaperPlane className="mr-2" /> Fee Reminder
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto tableWrap">
          {!isLoading && messages?.logs?.length > 0 ? (
            <CustomTable
              data={messages?.logs}
              headerNames={headerNames}
              maxTableHeight="40vh"
              height="20vh"
              // handleDelete={handleDeleteClass}
              // handleEdit={handleEditClass}
              handleDetails={handleViewDetails}
              handleSearch={handleSearchInputChange}
              searchTerm={searchQuery}
              searchPlaceholder="Search by message content, or recipient type"
              displayLinkBtn={false}
              displayDelBtn={false}
              displaySearchBar={true}
              // displayActions={
              //   session?.user?.role === "admin" ||
              //   session?.user?.role === "head teacher"
              // }
              itemDetails="class id."
              // handleOpenLink={handleOpenLink}
              displayEditBtn={false}
            />
          ) : (
            <div>No SMS sent yet</div>
          )}
        </div>
        {/* <SentMessagesLog
          messages={messages}
          onViewDetails={handleViewDetails}
        /> */}
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default MessagingCommunication;
