"use client";

import React, { useState, useEffect } from "react";
import AddEditDepartmentPage from "../../../components/department/addnewdepartment";
import { useSession } from "next-auth/react";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import Loadingpage from "../../../components/Loadingpage";
import { toast } from "react-toastify";

const AddNewDepartment = ({ id, staffData, departmentData, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    department_name: "",
    head_of_department: null,
    description: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("id", id);
    if (id && departmentData) {
      const initialFormData = {
        department_id: id,
        department_name: departmentData.department_name,
        head_of_department: departmentData.head_of_department,
        description: departmentData.description,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, departmentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting department form data:", formData);

    setIsModalOpen(true); // Open the modal instead of using window.confirm
  };

  const handleChange = (e) => {
    console.log("formData", formData);
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
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
    const toastId = toast.loading("Adding department...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const department = {
      department_name: formData.department_name,
      head_of_department: formData.head_of_department,
      description: formData.description,
    };

    try {
      const url = id
        ? `/api/classes/update/${id}`
        : "/api/department/adddepartment";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id ? "Failed to update department" : "Failed to add department");

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      console.log(
        id
          ? "department updated successfully:"
          : "department added successfully:",
        result
      );

      toast.update(toastId, {
        render:
          result.message || id
            ? "department updated successfully"
            : "department added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error(
        id ? "Error updating department:" : "Error adding department:",
        error
      );
      toast.update(toastId, {
        render:
          error || id ? "Error updating department" : "Error adding department",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.role != "admin") {
    return (
      <div className="flex items-center">
        you are not authorised to perform this action
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
        title={id ? "Update department?" : "Add New department"}
        message={
          id
            ? `Are you sure you want to update ${formData.department_name}'s details ?`
            : "Are you sure you want to add this new department?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <AddEditDepartmentPage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
        staffData={staffData}
      />
    </>
  );
};

export default AddNewDepartment;
