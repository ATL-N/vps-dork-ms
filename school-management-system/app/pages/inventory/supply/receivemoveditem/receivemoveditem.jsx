"use client";
import React, { useState, useEffect } from "react";
import {
  FaCalendarPlus,
  FaCalendar,
  FaVenusMars,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import Loadingpage from "../../../../components/Loadingpage";
import { useSession } from "next-auth/react";
import {
  InputField,
  SelectField,
  TextAreaField,
} from "../../../../components/inputFieldSelectField";

const ReceiveMovedItem = ({ id, itemData, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    staff_id: "",
    recipient_name: "",
    recipient_phone: "",
    comments: null,
    item_id: null,
    quantity: "",
    status: null,
    movement_type: "",
    returned_at: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["move items"];

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
    if (id && itemData) {
      const initialFormData = {
        movement_id: id,
        staff_id: itemData.staff_id,
        recipient_name: itemData.name,
        recipient_phone: itemData.contact,
        comments: itemData.comments,
        item_id: itemData.item_id,
        item_name: itemData.item_name,
        quantity: itemData.quantity,
        status: itemData.status,
        movement_type: itemData.movement_type,
        returned_at: itemData.returned_at,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, itemData]);

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const get20YearsAgoString = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    return date.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
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
    setIsLoading(true);
    const toastId3 = toast.loading("Processing...");

    const itemData = {
      movement_id: formData.movement_id,
      status: formData.status,
      returned_at: formData.returned_at,
      comments: formData.comments,
    };

    try {
      const response = await fetch("/api/inventory/receiveitemmovement", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Failed to receive item";
        toast.update(toastId3, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      console.log("Item received successfully:", result);
      toast.update(toastId3, {
        render: "Item received successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // You might want to call a function here to update the UI or close the modal
      onCancel();
    } catch (error) {
      console.error("Error receiving item:", error);
      toast.update(toastId3, {
        render: "Error receiving item",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const title = id ? `Edit Details` : "Add New semester";

  if (isLoading) {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page
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
              Semester Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Supply Type"
                name="movement_type"
                isDisAbled={true}
                icon={<FaFileAlt />}
                value={formData.movement_type}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select type of supply" },
                  { value: "Internal", label: "Internal Supply" },
                  { value: "External", label: "External Supply" },
                ]}
              />

              <InputField
                type="text"
                label="Recipient Name"
                name="recipient_name"
                isReadOnly={true}
                icon={<FaCalendar />}
                value={formData?.recipient_name}
                onChange={handleChange}
                // placeholder="e.g. First semester, First term etc"
              />

              {formData?.movement_type == "External" && (
                <InputField
                  type="text"
                  label="Recipient Phone"
                  name="recipient_phone"
                  isReadOnly={true}
                  icon={<FaCalendar />}
                  value={formData?.recipient_phone}
                  onChange={handleChange}
                  // placeholder="e.g. First semester, First term etc"
                />
              )}
              <InputField
                type="text"
                label="Item Name"
                name="item_name"
                isReadOnly={true}
                icon={<FaCalendar />}
                value={formData?.item_name}
                onChange={handleChange}
                // placeholder="e.g. First semester, First term etc"
              />

              <InputField
                type="text"
                label="Quantity"
                name="quantity"
                isReadOnly={true}
                icon={<FaCalendar />}
                value={formData?.quantity}
                onChange={handleChange}
                // placeholder="e.g. First semester, First term etc"
              />

              <SelectField
                label="Status"
                name="status"
                icon={<FaVenusMars />}
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Status" },
                  { value: "out", label: "Out Going" },
                  { value: "in", label: "In Coming" },
                ]}
              />

              <InputField
                type="date"
                label="Returned On"
                name="returned_at"
                icon={<FaCalendarPlus />}
                value={formData?.returned_at}
                onChange={handleChange}
                max={getTodayString()}
              />
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
            Receive Item
          </button>
        </div>
      </form>
    </>
  );
};

export default ReceiveMovedItem;
