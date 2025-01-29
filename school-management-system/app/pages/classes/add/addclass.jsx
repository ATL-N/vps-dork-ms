"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddEditClassPage from "../../../components/classescomponent/addeditclasspage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";

const Addnewclass = ({ id, classData, staffData, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    class_name: "",
    class_level: "",
    capacity: 30,
    room_number: "",
    staff_id: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    // console.log("classData", classData, staffData);
    if (id && classData) {
      const initialFormData = {
        class_id: id,
        class_name: classData.class_name,
        class_level: classData.class_level,
        staff_id: classData.staff_id,
        room_number: classData.room_name,
        capacity: classData.capacity,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, classData]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add class"];

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

  const handleChange = (e) => {
    // console.log("formData", formData);
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting class form data:", formData);

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
    const toastId = toast.loading("Processing...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const classData = {
      class_name: formData.class_name,
      class_level: formData.class_level,
      staff_id: formData.staff_id,
      room_number: formData.room_number,
      capacity: formData.capacity,
      user_id: session?.user?.id

    };

   try {
     const url = id
       ? `/api/classes/getclassbyId/${id}`
       : "/api/classes/addclass";
     const method = id ? "PUT" : "POST";

     const response = await fetch(url, {
       method: method,
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(classData),
     });

     const result = await response.json();

     if (!response.ok) {
       const errorMessage =
         result.error ||
         (id ? "Failed to update class" : "Failed to add class");
       throw new Error(errorMessage);
     }

     toast.update(toastId, {
       render:
         result.message ||
         (id ? "Class updated successfully" : "Class added successfully"),
       type: "success",
       isLoading: false,
       autoClose: 3000,
     });

     if (!id) {
       setFormData(initialState);
     }
     return
   } catch (error) {
    //  console.error(id ? "Error updating class:" : "Error adding class:", error);
     toast.update(toastId, {
       render:
         error.message || (id ? "Error updating class" : "Error adding class"),
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
        You are not authorised "add class" to be on this page
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update class?" : "Add New class?"}
        message={
          id
            ? `Are you sure you want to update ${formData.class_name}'s details ?`
            : "Are you sure you want to add this new class?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <AddEditClassPage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        staffData={staffData}
      />
    </>
  );
};

export default Addnewclass;
