"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import EditItemPage from "../../../../components/inventorycomponent/edititempage";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import Loadingpage from "../../../../components/Loadingpage";
import { useSession } from "next-auth/react";

const EditItem = ({ id, itemData, onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    item_name: "",
    category: "",
    unit_price: 0,
    quantity_desired: 0,
    quantity_available: 0,
    restock_level: 0,
    status: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
const [isAuthorised, setIsAuthorised] = useState(false);

useEffect(() => {

  const authorizedRoles = ["admin"];
  const authorizedPermissions = [
    "update item",
  ];

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
      console.log('itemData 2222', itemData)
      const initialFormData = {
        item_id: id,
        item_name: itemData.item_name,
        category: itemData.category,
        unit_price: itemData.unit_price,
        quantity_desired: itemData.quantity_desired,
        quantity_available: itemData.quantity_available,
        restock_level: itemData.restock_level,
        status: itemData.status,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [id, itemData]);

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
    setIsLoading(true)
    const toastId3 = toast.loading("Processing...");

    if (id && !hasChanges()) {
      setIsInfoModalOpen(true);
      toast.dismiss(toastId3);
      return;
    }

    const itemData = {
      ...formData,
      user_id: session?.user?.id
    };

    try {
      const url = id
        ? `/api/inventory/updateitem/${id}`
        : "/api/Item/addItem";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from the response
        const errorMessage =
          result.error ||
          (id ? "Failed to update Item" : "Failed to add Item");

        toast.update(toastId3, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return; // Exit the function early
      }

      console.log(
        id ? "Item updated successfully:" : "Item added successfully:",
        result
      );

      toast.update(toastId3, {
        render: result?.message || id
          ? "Item updated successfully"
          : "Item added successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error(
        id ? "Error updating Item:" : "Error adding Item:",
        error
      );
      toast.update(toastId3, {
        render: error || id ? "Error updating Item" : "Error adding Item",
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
        title={id ? "Update Item?" : "Add New Item"}
        message={
          id
            ? `Are you sure you want to update ${formData?.item_name}'s details ?`
            : "Are you sure you want to add this new Item?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={"Information"}
        message={"No changes detected. Please make changes before updating."}
      />

      <EditItemPage
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        id={id}
        onCancel={onCancel}
      />
    </>
  );
};

export default EditItem;
