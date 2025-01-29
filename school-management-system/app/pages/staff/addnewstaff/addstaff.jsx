"use client";
import React, { useState, useEffect } from "react";
import AddEditStaffPage from "../../../components/staffcomponent/AddEditStaffPage";
import { toast } from "react-toastify";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../config/firebase";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";

const AddEditStaff = ({ id, staffData }) => {
    const { data: session, status } = useSession();

  const initialState = {
    first_name: "",
    last_name: "",
    middle_name: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    address: "",
    phone_number: "",
    email: "",
    emergency_contact: "",
    date_of_joining: "",
    designation: "",
    department: "",
    salary: "",
    account_number: "",
    contract_type: "",
    employment_status: "",
    qualification: "",
    experience: "",
    blood_group: "",
    national_id: "",
    passport_number: "",
    photo: null,
    teaching_subject: "",
    role: "",
    medical_conditions: "",
    allergies: "",
    vaccination_status: "",
    sender_id: session?.user?.id,
  };


  const [formData, setFormData] = useState(initialState);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

useEffect(() => {
  const authorizedRoles = ["admin"];
  const authorizedPermissions = ["add staff"];

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
    const fetchStaffData = async () => {
      if (id && staffData) {
        const initialFormData = {
          ...staffData,
          staff_id: id,
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);

        if (staffData.photo) {
          try {
            const imageRef = ref(storage, staffData.photo);
            const imageUrl = await getDownloadURL(imageRef);
            setImagePreview(imageUrl);
          } catch (error) {
            console.error("Error fetching image from Firebase:", error);
            toast.error("Failed to load staff image.");
          }
        }
      }
    };
    fetchStaffData();
  }, [id, staffData]);

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        setImageUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setFormData((prevState) => ({ ...prevState, photo: file }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const hasChanges = () => {
    return (
      Object.keys(formData).some((key) => {
        if (key === "photo") return false;
        return formData[key] !== originalData[key];
      }) || imageUpload !== null
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

const handleConfirm = async () => {
    setIsLoading(true);
    setIsModalOpen(false);

    const toastId = toast.loading("Processing your request...");

    // Create a trimmed version of the form data
    const trimmedFormData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
            key,
            // Only trim string values, leave other types unchanged
            typeof value === 'string' ? value.trim() : value
        ])
    );

    if (id && !hasChanges()) {
        toast.update(toastId, {
            render: "No changes detected. Please make changes before updating.",
            type: "info",
            isLoading: false,
            autoClose: 5000,
        });
        setIsInfoModalOpen(true);
        return;
    }

    let photoURL = trimmedFormData.photo;

    if (imageUpload) {
        toast.update(toastId, {
            render: "Uploading image...",
            type: "info",
            isLoading: true,
        });

        const currentDate = new Date().toISOString();
        const imageRef = ref(storage, `images/${imageUpload.name + currentDate}`);
        try {
            const snapshot = await uploadBytes(imageRef, imageUpload);
            photoURL = await getDownloadURL(snapshot.ref);

            toast.update(toastId, {
                render: "Image uploaded successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });
        } catch (error) {
            toast.update(toastId, {
                render: "Error uploading image: " + error.message,
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
            return;
        }
    }

    const staffData = {
        ...trimmedFormData,
        photo: photoURL,
    };

    try {
        const url = id ? `/api/staff/updateStaff/${id}` : "/api/staff/addStaff";
        const method = id ? "PUT" : "POST";

        toast.update(toastId, {
            render: id ? "Updating staff information..." : "Adding new staff...",
            type: "info",
            isLoading: true,
        });

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(staffData),
        });

        const result = await response.json();

        if (!response.ok) {
            toast.update(toastId, {
                render: result.error || "An error occurred. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
            throw new Error(result.error || "Failed to process request");
        }

        toast.update(toastId, {
            render: result.message || "Operation completed successfully!",
            type: "success",
            isLoading: false,
            autoClose: 5000,
        });

        if (!id) {
            setFormData(initialState);
            setImagePreview(null);
            setImageUpload(null);
        }
        return;
    } catch (error) {
        console.error(
            id ? "Error updating Staff:" : "Error adding Staff:",
            error
        );
        toast.update(toastId, {
            render: error.message || "An error occurred. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
        });
    } finally {
        setIsLoading(false);
    }
};

  const onCancel = () => {
    if (id) {
      setFormData(originalData);
      setImagePreview(originalData.photo);
    } else {
      setFormData(initialState);
      setImagePreview(null);
      setImageUpload(null);
    }
  };

  if (isLoading || status==='loading') {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add staff" to be on this page
      </div>
    );
  }

  

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update Staff Member" : "Add New Staff Member"}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details?`
            : "Are you sure you want to add this new staff member?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="No changes detected. Please make changes before updating."
      />

      <AddEditStaffPage
        formData={formData}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleImageChange={handleChange}
        imagePreview={imagePreview}
        onCancel={onCancel}
        id={id}
      />
    </>
  );
};

export default AddEditStaff;
