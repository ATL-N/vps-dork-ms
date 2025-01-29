"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import Loadingpage from "../../../../components/Loadingpage";
import { useSession } from "next-auth/react";
import { InputField } from "../../../../components/inputFieldSelectField";

const Addeditpickup = ({ id, pickUpPointData, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    pick_up_point_name: "",
    pick_up_price: '',
    student_id: null, // Assuming you might need student ID later
    // status: "active",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add pick up point"];

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
  }, [session]);

  useEffect(() => {
    if (id && pickUpPointData) {
      const initialFormData = {
        pick_up_id: id,
        pick_up_point_name: pickUpPointData.pick_up_point_name,
        pick_up_price: pickUpPointData.pick_up_price,
        student_id: pickUpPointData.student_id, // Include student_id if needed
        status: pickUpPointData.status || "active",
      };
      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, pickUpPointData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      return;
    }

    setIsModalOpen(true);
  };

  const hasChanges = () => {
    return Object.keys(formData).some((key) => {
      if (key === "image_upload") return false;
      return formData[key] !== originalData[key];
    });
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    const toastId = toast.loading("Processing...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const pickUpPointData = {
      ...formData,
      user_id: session?.user?.id,
    };

    try {
      const url = id
        ? `/api/feedingNtransport/pickup/update/${id}`
        : "/api/feedingNtransport/pickup/all";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pickUpPointData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error ||
          (id ? "Failed to update pickup point" : "Failed to add pickup point");

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      console.log(
        id
          ? "pickup point updated successfully:"
          : "pickup point added successfully:",
        result
      );

      toast.update(toastId, {
        render: id
          ? "pickup point updated successfully"
          : "pickup point added successfully",
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
        id ? "Error updating pickup point:" : "Error adding pickup point:",
        error
      );
      toast.update(toastId, {
        render: id
          ? "Error updating pickup point"
          : "Error adding pickup point",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || status === "loading") {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add pick up point" to be on this page...!
      </div>
    );
  }

  const title = id ? `Edit Pick-up Point` : "Add New Pick-up Point";

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update Pick-up Point?" : "Add New Pick-up Point"}
        message={
          id
            ? `Are you sure you want to update ${formData.pick_up_point_name}'s details ?`
            : "Are you sure you want to add this new pick-up point?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600"
      >
        <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
          {title}
        </h2>

        <div className="space-y-8">
          <section className="text-cyan-600">
            <h3 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
              Pick-up Point Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                type="text"
                label="Pick-up Point Name"
                name="pick_up_point_name"
                value={formData?.pick_up_point_name}
                onChange={handleChange}
                placeholder="e.g. Airport, Accra Mall ... etc"
              />

              <InputField
                type="number"
                label="Pick-up Price"
                name="pick_up_price"
                value={formData?.pick_up_price}
                onChange={handleChange}
                placeholder="e.g. 20, 30... etc"
              />

              {/* student id will be implimented later when neccesary
                 <InputField
                  type="number"
                  label="Student ID"
                  name="student_id"
                  value={formData?.student_id}
                  onChange={handleChange}
                  placeholder="e.g. 12345, 24567... etc"
                 /> */}
            </div>
          </section>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            Close
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            {id ? "Update Pick-up Point" : "Add Pick-up Point"}
          </button>
        </div>
      </form>
    </>
  );
};

export default Addeditpickup;
