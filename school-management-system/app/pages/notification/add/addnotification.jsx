"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CreateNotification from "../../../components/notificationscomponent/addnotification";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import Loadingpage from "../../../components/Loadingpage";
import { useSession } from "next-auth/react";

const Sendnotification = ({ id, notificationData, onCancel, usersData }) => {
  const { data: session, status } = useSession();
  // const sender_id = session?.user?.id;
  // console.log("session_id,", sender_id);

  const initialState = {
    notification_title: "",
    notification_message: "",
    notification_type: "general",
    priority: "normal",
    // sender_id: '',
    sender_id: session?.user?.id,
    recipient_type: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["send notification"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      session?.user?.role === "admin"
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session]);

  useEffect(() => {
    // console.log("id", id);
    if (id && notificationData) {
      const initialFormData = {
        semester_id: id,
        supplier_name: notificationData.supplier_name,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, notificationData]);

  const handleChange = (e) => {
    //  console.log("formData", formData);
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  //  const handleRecipientChange = (recipient_id) => {
  //    setFormData((prevData) => ({
  //      ...prevData,
  //      recipients: prevData.recipients.includes(recipient_id)
  //        ? prevData.recipients.filter((id) => id !== recipient_id)
  //        : [...prevData.recipients, recipient_id],
  //    }));
  //  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting notification form data:", formData);

    setIsModalOpen(true); // Open the modal instead of using window.confirm
  };

  const hasChanges = () => {
    return (
      Object.keys(formData).some((key) => {
        // Skip comparison for image_upload as it's handled separately
        if (key === "image_upload") return false;
        return formData[key] !== originalData[key];
      }) || imageUpload !== null
    );
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    const toastId = toast.loading("Sending notifications...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const notificationData = {
      ...formData,
    };

    try {
      const url = id
        ? `/api/classes/update/${id}`
        : "/api/notification/sendnotification";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id
            ? "Failed to update notification"
            : "Failed to send notification");

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      // console.log(
      //   id
      //     ? "notification updated successfully:"
      //     : "notification added successfully:",
      //   result
      // );

      toast.update(toastId, {
        render: id
          ? "notification updated successfully"
          : "notification added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error(
        id ? "Error updating notification:" : "Error adding notification:",
        error
      );
      toast.update(toastId, {
        render: id
          ? "Error updating notification"
          : "Error adding notification",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center text-cyan-600">
        You are not authorised "send notification" to be on this page
      </div>
    );
  }

  

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update notification?" : "send New notification"}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details ?`
            : "Are you sure you want to send this new notification?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <CreateNotification
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default Sendnotification;
