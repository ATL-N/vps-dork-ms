"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddEditGradingSchemePage from "../../../components/gradingcomponent/addeditgradingscheme";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import { fetchData } from "../../../config/configFile";
import LoadingPage from "../../../components/generalLoadingpage";

const Addeditgradescheme = ({ id, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    grade_name: "",
    minimum_mark: '',
    maximum_mark: '',
    grade_remark: '',
  };

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [gradingSchemedata, setGradingSchemedata] = useState([]);
const [isAuthorised, setIsAuthorised] = useState(true);
const [activeSemester, setActiveSemester] = useState();

 useEffect(() => {
  //  console.log("id", id);
   if (id) {
     setIsLoading(true)
      fetchGradingSchemeData(id);
     setIsLoading(false)
   }
 }, [id]);


  useEffect(() => {
    // console.log("id", id);
    setIsLoading(true)
    if (id && gradingSchemedata) {
      const initialFormData = {
        grade_id: id,
        grade_name: gradingSchemedata.grade_name,
        minimum_mark: gradingSchemedata.minimum_mark,
        maximum_mark: gradingSchemedata.maximum_mark,
        grade_remark: gradingSchemedata.grade_remark,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
    setIsLoading(false)
  }, [id, gradingSchemedata]);

 useEffect(() => {
   const authorizedRoles = ["admin"];
   const authorizedPermissions = ["add grading scheme"];

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

   const fetchGradingSchemeData = async (scheme_id) => {
    setIsLoading(true)
     const response = await fetchData(
       `/api/grading/getgradingscheme/${scheme_id}`,
       "",
       false
     );

    //  function extractEventsData(events) {
    //    return events?.map((event) => ({
    //      id: event.id,
    //      title: event.title,
    //      date: event.date,
    //      type: event.type,
    //    }));
    //  }

     setGradingSchemedata(response);
     setIsLoading(false)
   };

  const handleChange = (e) => {
    // console.log("formData", formData);
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    const toastId2 = toast.loading("Processing...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId2);
      return;
    }

    const gradingSchemedata = {
      grade_name: formData.grade_name,
      minimum_mark: formData.minimum_mark,
      maximum_mark: formData.maximum_mark,
      grade_remark: formData.grade_remark,
    };

    try {
      const url = id
        ? `/api/grading/getgradingscheme/${id}`
        : "/api/grading/addgradescheme";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gradingSchemedata),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id ? "Failed to update Grading scheme" : "Failed to add Grading scheme");

        toast.update(toastId2, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      toast.update(toastId2, {
        render: result.message || id
          ? "Grading scheme updated successfully"
          : "Grading scheme added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      toast.update(toastId2, {
        render: error ||  id ? "Error updating Grading scheme" : "Error adding Grading scheme",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  // if (isLoading) {
  //   return (
  //     <div className="text-cyan-700">
  //       <LoadingPage />
  //     </div>
  //   );
  // }
  
  if (status === "loading" || isLoading) {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add grading scheme" to be on this page
      </div>
    );
  }


  return (
    <>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update Grading scheme?" : "Add New Grading scheme"}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details ?`
            : "Are you sure you want to add this new Grading scheme?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <AddEditGradingSchemePage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default Addeditgradescheme;
