"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBell, FaPlus, FaEye, FaExclamationCircle } from "react-icons/fa";
import CustomTable from "../../components/listtableForm";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import Sendnotification from "./add/addnotification";
import Loadingpage from "../../components/Loadingpage";
import NotificationDetails from "./notificationdetails/page";
import { fetchData } from "../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";

const NotificationCenter = () => {
    const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [activeSemester, setActiveSemester] = useState();

  let formatedData;

  const headerNames = ["ID", "Title", "Type", "Priority", "Sent Date"];

  function extractStaffData(tableData) {
    return tableData.map((dataitem) => ({
      id: dataitem.notification_id,
      notification_title: dataitem.notification_title,
      notification_type: dataitem.notification_type,
      priority: dataitem.priority,
      sent_at: formatDate(dataitem.sent_at),
    }));
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view notifications"];

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

    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      setActiveSemester(session?.user?.activeSemester?.semester_id);
      // setUserId(session?.user?.id);
    }
  }, [session, status]);



  useEffect(() => {
    fetchNotifications();

    // extractStaffData(notifications);
  }, []);

  const fetchNotifications = async (searchQuery1 = "") => {
    // setIsLoading(true);
    // const toastId = toast.loading("Fetching notifications...");

    try {
      // setIsLoading(true);
      setError(null);

      let url = "/api/notification/allnotifications";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        // throw new Error("Failed to fetch notifications");
        toast.update(toastId, {
          render: "Failed to fetch notifications",
          type: "info",
          isLoading: false,
          autoClose: 3000,
        });
      }

      const data = await response.json();
      setNotifications(extractStaffData(data));
      return data;
    } catch (err) {
      setError(err.message);
      // toast.update(toastId, {
      //   render: `Error: ${err.message}`,
      //   type: "error",
      //   isLoading: false,
      //   autoClose: 3000,
      // });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNotification = () => {
    setModalContent(
      <Sendnotification
        setShowModal={setShowModal}
        onCancel={() => {
          setShowModal(false);
          fetchNotifications();
        }}
      />
    );
    setShowModal(true);
  };

  const handleNotificationDetails = (notificationId) => {
    setModalContent(
      <NotificationDetails
        notificationId={notificationId}
        setShowModal={setShowModal}
        onClose={() => setShowModal(false)}
      />
    );
    setShowModal(true);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchNotifications(e.target.value);
  };


  if (isLoading || status==='loading')
    return (
      <div>
        <LoadingPage />
      </div>
    );

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-700">
        You are not authorised "view notifications" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <div className="pb-16 text-cyan-600">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Notification Center
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<FaBell />}
            title="Total Notifications"
            value={notifications.length}
          />
          <StatCard
            icon={<FaExclamationCircle />}
            title="High Priority"
            value={notifications.filter((n) => n.priority === "High").length}
          />
          <StatCard
            icon={<FaEye />}
            title="Unread"
            value={notifications.filter((n) => !n.read).length}
          />
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Notifications
            </h2>
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "send notification"
              )) && 
                <button
                  onClick={handleCreateNotification}
                  className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
                >
                  <FaPlus className="mr-2" /> Send Notification
                </button>
              }
          </div>

          <div className="overflow-x-auto tableWrap">
            {!isLoading ? (
              <CustomTable
                data={notifications}
                headerNames={headerNames}
                maxTableHeight="40vh"
                height="20vh"
                handleDetails={handleNotificationDetails}
                handleSearch={handleSearchInputChange}
                searchTerm={searchQuery}
                searchPlaceholder="Search by title, type, or priority"
                displayActions={false}
              />
            ) : (
              <Loadingpage />
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default NotificationCenter;
