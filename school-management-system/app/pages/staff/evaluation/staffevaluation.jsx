"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Teacherperformanceevaluationpage from "../../../components/staffcomponent/teacherevaluationpage";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";
import Loadingpage from "../../../components/Loadingpage";

const TeacherEvaluation = ({
  evaluation_id,
  staff_id,
  staffData,
  pastEvaluation,
  onCancel,
}) => {
  const { data: session, status } = useSession();

  const initialState = {
    evaluatee_id: staff_id,
    evaluation_date: "",
    overall_rating: "",
    teaching_effectiveness: "",
    classroom_management: "",
    student_engagement: "",
    professionalism: "",
    comments: "",
    years_of_experience: "",
    evaluator_id: session?.user?.id,
  };

  const [formData, setFormData] = useState(initialState);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["evaluate staff"];

    if (
      session?.user?.role === "admin" ||
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      )
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
    setIsLoading(false);
  }, [session, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      const newState = { ...prevState, [name]: value };

      if (
        [
          "teaching_effectiveness",
          "classroom_management",
          "student_engagement",
          "professionalism",
        ].includes(name)
      ) {
        const ratings = [
          newState.teaching_effectiveness,
          newState.classroom_management,
          newState.student_engagement,
          newState.professionalism,
        ].filter((rating) => rating !== "");

        if (ratings.length > 0) {
          const average =
            ratings.reduce((sum, rating) => sum + parseFloat(rating), 0) /
            ratings.length;
          newState.overall_rating = average.toFixed(2);
        } else {
          newState.overall_rating = "";
        }
      }

      return newState;
    });
  };

  const hasChanges = () => {
    return Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsModalOpen(false);

    const toastId2 = toast.loading("Processing your request...");

    if (evaluation_id && !hasChanges()) {
      toast.update(toastId2, {
        render: "No changes detected. Please make changes before updating.",
        type: "info",
        isLoading: false,
        autoClose: 5000,
      });
      setIsInfoModalOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      const url = evaluation_id
        ? `/api/staff/evaluation/${evaluation_id}`
        : "/api/staff/evaluation";
      const method = evaluation_id ? "PUT" : "POST";

      toast.update(toastId2, {
        render: evaluation_id
          ? "Updating evaluation..."
          : "Adding new evaluation...",
        type: "info",
        isLoading: true,
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process request");
      }

      console.log(
        evaluation_id
          ? "Evaluation updated successfully:"
          : "Evaluation added successfully:",
        result
      );

      toast.update(toastId2, {
        render: result.message || "Operation completed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      if (!evaluation_id) {
        setFormData(initialState);
      }

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error(
        evaluation_id
          ? "Error updating evaluation:"
          : "Error adding evaluation:",
        error
      );
      toast.update(toastId2, {
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
        You are not authorised "evaluate staff" to be on this page...!
      </div>
    );
  }

 

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={evaluation_id ? "Update Evaluation" : "Add Evaluation"}
        message={
          evaluation_id
            ? `Are you sure you want to update this evaluation?`
            : "Are you sure you want to add this new evaluation?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="No changes detected. Please make changes before updating."
      />

      <Teacherperformanceevaluationpage
        handleChange={handleChange}
        formData={formData}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        teacherData={staffData}
        pastEvaluations={pastEvaluation}
        isEditing={!!evaluation_id}
      />
    </>
  );
};

export default TeacherEvaluation;
