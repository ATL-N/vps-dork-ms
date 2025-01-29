"use client";
import React, { useState, useEffect } from "react";
import Addeditstudent from "../../../components/studentcomponents/addeditstudent";
import { toast } from "react-toastify";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../config/firebase";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";

const Addnewstudent = ({
  id,
  parentsData,
  classesData,
  pickupData,
  onCancel,
  studentsData,
  details,
}) => {
  const { data: session, status } = useSession();

  const initialState = {
    photo: null,
    first_name: "",
    last_name: "",
    other_names: "",
    date_of_birth: "",
    gender: "",
    class_id: "",
    amountowed: '',
    residential_address: "",
    phone: "",
    email: "",
    enrollment_date: "",
    national_id: '',
    birth_cert_id: '',

    // feeding and transport details
    transportation_method: "",
    pick_up_point: "",
    feeding_fee: '',
    transport_fee: '',

    // medical records user_health_record
    medical_conditions: "",
    allergies: "",
    blood_group: "",
    vaccination_status: "",
    health_insurance_id: "",

    // parents info/details
    parent1_other_names: "",
    parent1_last_name: "",
    parent1_phone: "",
    parent1_email: "",
    parent1_address: "",
    parent1_relationship: "",
    parent1_selection: "",

    parent2_other_names: "",
    parent2_last_name: "",
    parent2_phone: "",
    parent2_email: "",
    parent2_address: "",
    parent2_relationship: "",
    parent2_selection: "",
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
    const authorizedPermissions = ["add student"];

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
  }, [session, status]);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (id && studentsData) {
        // console.log("studentsData", studentsData?.parent1.parent_id);
        const initialFormData = {
          ...studentsData,
          student_id: id,
          date_of_birth: studentsData.date_of_birth,
          parent1_selection: studentsData?.parent1?.parent_id,
          parent1_other_names: studentsData?.parent1?.other_names,
          parent1_last_name: studentsData?.parent1?.last_name,
          parent1_phone: studentsData?.parent1?.phone,
          parent1_email: studentsData?.parent1?.email,
          parent1_address: studentsData?.parent1?.address,
          parent1_relationship: studentsData?.parent1?.relationship,

          parent2_selection: studentsData?.parent2?.parent_id,
          parent2_other_names: studentsData?.parent2?.other_names,
          parent2_last_name: studentsData?.parent2?.last_name,
          parent2_phone: studentsData?.parent2?.phone,
          parent2_email: studentsData?.parent2?.email,
          parent2_address: studentsData?.parent2?.address,
          parent2_relationship: studentsData?.parent2?.relationship,
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);

        if (studentsData.photo) {
          try {
            const imageRef = ref(storage, studentsData.photo);
            const imageUrl = await getDownloadURL(imageRef);
            setImagePreview(imageUrl);
          } catch (error) {
            console.error("Error fetching image from Firebase:", error);
            toast.error("Failed to load students image.");
          }
        }
      }
    };
    fetchStaffData();
  }, [id, studentsData]);

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
    } else if (name === "pick_up_point") {
      // Find the corresponding pickup point data
      const selectedPickup = pickupData.find(
        (pickup) => pickup.pick_up_id==value
      );
      console.log("pick_up_point:", selectedPickup, value, pickupData);

      // Update both pickup point and transport fee
      setFormData((prevState) => ({
        ...prevState,
        pick_up_point: value,
        transport_fee: selectedPickup ? selectedPickup.pick_up_price : "",
      }));
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
    // console.log("formData", formData);

    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsModalOpen(false);

    const toastId = toast.loading("Processing your request...");

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

    let photoURL = formData.photo;

    if (imageUpload) {
      toast.update(toastId, {
        render: "Uploading image...",
        type: "info",
        isLoading: true,
      });

      const currentDate = new Date().toISOString();
      const imageRef = ref(storage, `images/${imageUpload.name + currentDate}`);

      if (originalData?.photo !== formData?.photo) {
        // console.log("working on image");
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
    }

    const studentsData = {
      ...formData,
      photo: photoURL,
    };

    try {
      const url = id ? `/api/students/${id}` : "/api/students/addstudent";
      const method = id ? "PUT" : "POST";

      toast.update(toastId, {
        render: id
          ? "Updating students information..."
          : "Adding new students...",
        type: "info",
        isLoading: true,
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentsData),
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

      // console.log(
      //   id ? "students updated successfully:" : "students added successfully:",
      //   result
      // );

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
    } catch (error) {
      console.error(
        id ? "Error updating students:" : "Error adding students:",
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

   if (isLoading || status==='loading') {
     return <Loadingpage />;
   }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add student" to be on this page
      </div>
    );
  }

 

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update students Member" : "Add New students Member"}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details?`
            : "Are you sure you want to add this new students member?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="No changes detected. Please make changes before updating."
      />

      <Addeditstudent
        formData={formData}
        parentsData={parentsData || []}
        classesData={classesData || []}
        pickupData={pickupData}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        imagePreview={imagePreview}
        onCancel={onCancel}
        id={id}
        isDetails={details}
      />
    </>
  );
};

export default Addnewstudent;
