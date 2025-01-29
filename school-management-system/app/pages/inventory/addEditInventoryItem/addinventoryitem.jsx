"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Addeditinventoryitempage from "../../../components/inventorycomponent/addeditinventoryitempage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";
import { submitData } from "../../../config/configFile";

const Addeditinventoryitem = ({id ,classData, semesterData, onCancel }) => {
  const { data: session, status } = useSession();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedPermissions = ["add inventory", "update inventory", 'add staff'];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      )
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

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
        restock_level: "",
        quantity: "",
        unit_price: "",
        total_price: "",
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
    setIsLoading(true)
    submitData({
      apiUrl: "/api/inventory/addinventories",
      data: {
        class_id: selectedClassId,
        semester_id: selectedSemesterId,
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
    setIsLoading(false)
  };

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page
      </div>
    );
  }

  if (isLoading) {
    return <Loadingpage />;
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Add New Inventories?"
        message="Are you sure you want to add these new inventories?"
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="Please add at least one inventory item before submitting."
      />

      <Addeditinventoryitempage
        classData={classData}
        semesterData={semesterData}
        selectedClassId={selectedClassId}
        selectedSemesterId={selectedSemesterId}
        handleClassChange={handleClassChange}
        handleSemesterChange={handleSemesterChange}
        inventoryItems={inventoryItems}
        handleSubmit={handleSubmit}
        handleInvoiceChange={handleInvoiceChange}
        addInvoiceItem={addInvoiceItem}
        removeInvoiceItem={removeInvoiceItem}
        resetForm={resetForm}
        onCancel={onCancel}
      />
    </>
  );
};

export default Addeditinventoryitem;
