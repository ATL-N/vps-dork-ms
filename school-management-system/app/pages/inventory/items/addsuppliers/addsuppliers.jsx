"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddEditSupplierpage from "../../../../components/inventorycomponent/addeditnewsuppliers";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import Loadingpage from "../../../../components/Loadingpage";
import { useSession } from "next-auth/react";

const Addeditsupplier = ({ id, supplierData, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    supplier_name: "",
    contact_name: "",
    contact_phone: null,
    contact_email: "",
    address: "",
    details: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add supplier", "update supplier"];

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
    if (id && supplierData) {
      const initialFormData = {
        supply_id: id,
        supplier_name: supplierData.supplier_name,
        contact_name: supplierData?.contact_name,
        contact_phone: supplierData?.contact_phone,
        contact_email: supplierData?.contact_email,
        address: supplierData?.address,
        details: supplierData?.details,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, supplierData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      // toast.dismiss(toastId);
      return;
    }

    setIsModalOpen(true); // Open the modal instead of using window.confirm
  };

  const hasChanges = () => {
    return (
      Object.keys(formData).some((key) => {
        // Skip comparison for image_upload as it's handled separately
        if (key === "image_upload") return false;
        return formData[key] !== originalData[key];
      })
    );
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    const toastId = toast.loading("Adding supplier...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId);
      return;
    }

    const supplierData = {
      ...formData,
      user_id: session?.user?.id,
    };

    try {
      const url = id
        ? `/api/inventory/suppliers/update/${id}`
        : "/api/inventory/suppliers/all";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id ? "Failed to update supplier" : "Failed to add supplier");

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      console.log(
        id ? "supplier updated successfully:" : "supplier added successfully:",
        result
      );

      toast.update(toastId, {
        render: id
          ? "supplier updated successfully"
          : "supplier added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
      return
    } catch (error) {
      console.error(
        id ? "Error updating supplier:" : "Error adding supplier:",
        error
      );
      toast.update(toastId, {
        render: id ? "Error updating supplier" : "Error adding supplier",
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
        You are not authorised to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update supplier?" : "Add New supplier"}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details ?`
            : "Are you sure you want to add this new supplier?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <AddEditSupplierpage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default Addeditsupplier;
