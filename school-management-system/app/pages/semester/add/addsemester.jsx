"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddNewSemester from "../../../components/semestercomponent/addnewsemester";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import Loadingpage from "../../../components/Loadingpage";
import { useSession } from "next-auth/react";

const Addeditsemester = ({ id, semesterdata, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    semester_name: "",
    status: "",
    start_date: null,
    end_date: null,
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add semester"];

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
    if (id && semesterdata) {
      const initialFormData = {
        semester_id: id,
        semester_name: semesterdata.semester_name,
        status: semesterdata.status,
        start_date: semesterdata.start_date,
        end_date: semesterdata.end_date,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, semesterdata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsModalOpen(true); // Open the modal instead of using window.confirm
  };

  const hasChanges = () => {
    return Object.keys(formData).some((key) => {
      // Skip comparison for image_upload as it's handled separately
      if (key === "image_upload") return false;
      return formData[key] !== originalData[key];
    });
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    const toastId3 = toast.loading("Processing...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId3);
      return;
    }

    const semesterdata = {
      ...formData,
    };

    try {
      const url = id
        ? `/api/semester/updatesemester/${id}`
        : "/api/semester/addsemester";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(semesterdata),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id ? "Failed to update semester" : "Failed to add semester");

        toast.update(toastId3, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      console.log(
        id ? "semester updated successfully:" : "semester added successfully:",
        result
      );

      toast.update(toastId3, {
        render:
          result.message || id
            ? "semester updated successfully"
            : "semester added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
      return;
    } catch (error) {
      console.error(
        id ? "Error updating semester:" : "Error adding semester:",
        error
      );
      toast.update(toastId3, {
        render:
          result.error || id
            ? "Error updating semester"
            : "Error adding semester",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

   if (isLoading || status==='loading') {
     return <Loadingpage />;
   }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add semester" to be on this page
      </div>
    );
  }

 
  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update semester?" : "Add New semester"}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details ?`
            : "Are you sure you want to add this new semester?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <AddNewSemester
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default Addeditsemester;
