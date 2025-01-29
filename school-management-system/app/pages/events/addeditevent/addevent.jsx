"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Addeditneweventpage from "../../../components/eventscomponent/addnewevent";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";


const Addeditevent = ({
  id,
  eventData,
  onCancel,
}) => {
  const { data: session, status } = useSession();

  const initialState = {
    event_title: "",
    event_type: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
    target_audience: "",
    user_id: session?.user?.id,
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [displayForm, setDisplayForm] = useState(false);

  useEffect(() => {
    console.log("id", id);
    if (id && eventData) {
      const initialFormData = {
        event_id: id,
        event_title: eventData.event_title,
        event_type: eventData.event_type,
        event_date: eventData.event_date1,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location,
        description: eventData.description,
        target_audience: eventData.target_audience,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, eventData]);

  useEffect(() => {
    const authorizedRoles = ["admin", "head teacher"];
    const authorizedPermissions = ["add event", "update event"];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting event form data:", formData);

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
    
    setIsModalOpen(false); // Close the modal
    setIsLoading(true)
    const toastId = toast.loading("Processing...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const eventData = {
      ...formData,
    };


    try {
      const url = id ? `/api/events/updateevent/${id}` : "/api/events/addevent";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error ||
          (id ? "Failed to update event" : "Failed to add event");
        throw new Error(errorMessage);
      }

      toast.update(toastId, {
        render:
          result.message ||
          (id ? "event updated successfully" : "event added successfully"),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error(
        id ? "Error updating event:" : "Error adding event:",
        error
      );
      toast.update(toastId, {
        render:
          error.message || (id ? "Error updating event" : "Error adding event"),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
      // setShowModal(false);
    }
  };

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add event" to be on this page
      </div>
    );
  }

    if (isLoading) {
      return <Loadingpage />;
    }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update event?" : "Add New event?"}
        message={
          id
            ? `Are you sure you want to update ${formData.event_title}'s details ?`
            : "Are you sure you want to add this new event?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        event_title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <Addeditneweventpage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default Addeditevent;
