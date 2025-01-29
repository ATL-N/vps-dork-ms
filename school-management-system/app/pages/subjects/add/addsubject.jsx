"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddEditSubjectPage from "../../../components/subjectscomponent/addeditsubjectpage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import Loadingpage from "../../../components/Loadingpage";
import { useSession } from "next-auth/react";


const AddnewSubject = ({ id, subjectdata, onCancel }) => {

    const { data: session, status } = useSession();

  const initialState = {
    subject_name: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
const [isAuthorised, setIsAuthorised] = useState(true);
const [activeSemester, setActiveSemester] = useState();

useEffect(() => {
  const authorizedRoles = ["admin"];
  const authorizedPermissions = ["add subject"];

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
    console.log("id", subjectdata);
    if (id && subjectdata) {
      const initialFormData = {
        subject_id: id,
        subject_name: subjectdata?.subject_name,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, subjectdata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting subject form data:", formData);

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
    setIsLoading(true)
    const toastId1 = toast.loading("Adding subject...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId1);
      return;
    }

    const subjectdata = {
      subject_name: formData.subject_name,
      user_id: session.user?.id
    };

    try {
      const url = id
        ? `/api/subjects/updatesubject/${id}`
        : "/api/subjects/addsubject";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subjectdata),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id ? "Failed to update subject" : "Failed to add subject");

        toast.update(toastId1, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      console.log(
        id ? "Subject updated successfully:" : "Subject added successfully:",
        result
      );

      toast.update(toastId1, {
        render: id
          ? "Subject updated successfully"
          : "Subject added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error(
        id ? "Error updating subject:" : "Error adding subject:",
        error
      );
      toast.update(toastId1, {
        render: id ? "Error updating subject" : "Error adding subject",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

   if (isLoading) {
     return <Loadingpage />;
   }

 if (!isAuthorised) {
   return (
     <div className="flex items-center text-cyan-700">
       You are not authorised "add subject" to be on this page...!
     </div>
   );
 }

    return (
      <>
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
          title={id ? "Update subject?" : "Add New subject"}
          message={
            id
              ? `Are you sure you want to update ${formData.subject_name}'s details ?`
              : "Are you sure you want to add this new subject?"
          }
        />

        <InfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          title={"Information"}
          message={"No changes detected. Please make changes before updating."}
        />

        <AddEditSubjectPage
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          id={id}
          onCancel={onCancel}
        />
      </>
    );
};

export default AddnewSubject;
