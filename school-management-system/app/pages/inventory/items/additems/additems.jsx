"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Addedititemspage from "../../../../components/inventorycomponent/addedititemspage";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../../components/Loadingpage";
import { submitData } from "../../../../config/configFile";

const Addedititems = ({ id, itemdata, onCancel }) => {
  const { data: session, status } = useSession();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];

    const authorizedPermissions = ["add items"];

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

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setInventoryItems([]);
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setSelectedSemesterId(semesterId);
    setInventoryItems([]);
  };

  const handleInvoiceChange = (index, field, value) => {
    const newInvoiceItems = [...inventoryItems];
    newInvoiceItems[index][field] = value;
    setInventoryItems(newInvoiceItems);
    // console.log('inventoryItems:', inventoryItems)
  };

  const addInvoiceItem = () => {
    setInventoryItems([
      ...inventoryItems,
      {
        inventory_name: "",
        category: "",
        restock_level: "",
        quantity_available: "",
        quantity_desired: "",
        unit_price: "",
      },
    ]);
  };

  const removeInvoiceItem = (index) => {
    const newInvoiceItems = inventoryItems.filter((_, i) => i !== index);
    setInventoryItems(newInvoiceItems);
  };

  const resetForm = () => {
    setInventoryItems([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inventoryItems.length === 0) {
      setIsInfoModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);

    console.log("inventoryItems", inventoryItems);
    setIsLoading(true);
    submitData({
      apiUrl: "/api/inventory/additems",
      data: {
        // class_id: selectedClassId,
        // semester_id: selectedSemesterId,
        inventory_items: inventoryItems,
      },
      successMessage: "Inventory added successfully",
      errorMessage: "Failed to add inventory items",

      onSuccess: (result) => {
        // Any additional actions on success
        resetForm();
        setSelectedClassId("");
        setSelectedSemesterId("");
      },
      onError: (error) => {
        // Any additional actions on error
      },
    });
    setIsLoading(false);
  };

  if (isLoading || status === "loading") {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add items" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Add New Items?"
        message="Are you sure you want to add these new items ?"
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="Please add at least one inventory item before submitting."
      />

      <Addedititemspage
        inventoryItems={inventoryItems}
        handleSubmit={handleSubmit}
        handleInvoiceChange={handleInvoiceChange}
        addInvoiceItem={addInvoiceItem}
        removeInvoiceItem={removeInvoiceItem}
        resetForm={resetForm}
        onClose={onCancel}
      />
    </>
  );
};

export default Addedititems;
