"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Addeditprocurementpage from "../../../../components/inventorycomponent/addeditprocurementpage";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../../components/generalLoadingpage";
import { submitData, fetchData } from "../../../../config/configFile";
import { FaRegPenToSquare } from "react-icons/fa6";

const Addeditprocurement = ({
  id,
  itemsData,
  onCancel,
  supplier_id,
  selected_date,
  readonly = false,
}) => {
  const { data: session, status } = useSession();

  const [selectedSupplierId, setSelectedSupplierId] = useState(
    supplier_id || ""
  );
  const [selectedDate, setSelectedDate] = useState(selected_date || "");
  const [procuredItems, setProcuredItems] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isEditing, setIsEditing] = useState(!!supplier_id && !!selected_date);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add new procurements"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsLoading(true);
      fetchItems();
      setIsAuthorised(true);
      if (isEditing) {
        fetchExistingProcurement();
      }
      setIsLoading(false);
    } else {
      setIsAuthorised(false);
    }
  }, [session, supplier_id, selected_date]);

  const fetchItems = async () => {
    const suppliers = await fetchData(
      "/api/inventory/suppliers/get",
      "",
      false
    );
    setSuppliersData(suppliers);
  };

  const fetchExistingProcurement = async () => {
    setIsLoading(true);
    try {
      const existingData = await fetchData(
        `/api/inventory/getsupplierndateprocurement?supplier_id=${supplier_id}&selected_date=${selected_date}`,
        "",
        false
      );
      if (existingData && existingData.procured_items) {
        setProcuredItems(existingData.procured_items);
      }
    } catch (error) {
      toast.error("Failed to fetch existing procurement data");
    }
    setIsLoading(false);
  };

  const handleSupplierChange = (e) => {
    const newSupplierId = e.target.value;
    setSelectedSupplierId(newSupplierId);
    if (isEditing && newSupplierId !== supplier_id) {
      setProcuredItems([]);
      setIsEditing(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (isEditing && newDate !== selected_date) {
      setProcuredItems([]);
      setIsEditing(false);
    }
  };

  const handleInvoiceChange = (index, field, value) => {
    const updatedItems = [...procuredItems];

    if (field === "item_id") {
      // Find the selected item from itemsData
      const selectedItem = itemsData.find(
        (item) => item.item_id === parseInt(value)
      );

      if (selectedItem) {
        // Update item_id and unit_price from the selected item
        updatedItems[index] = {
          ...updatedItems[index],
          item_id: value,
          unit_price: selectedItem.unit_price,
          // unit_cost: selectedItem.unit_price, // Also update unit_cost to match unit_price
          // total_cost: (
          //   parseFloat(selectedItem.unit_price) *
          //   (updatedItems[index].quantity || 0)
          // ).toFixed(2),
        };
      }
    } else {
      // Handle other field changes
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      // If quantity or unit_cost changes, update total_cost
      if (field === "quantity" || field === "unit_cost") {
        updatedItems[index].total_cost = (
          parseFloat(updatedItems[index].quantity || 0) *
          parseFloat(updatedItems[index].unit_cost || 0)
        ).toFixed(2);
      }
    }

    setProcuredItems(updatedItems);
  };

  const addInvoiceItem = () => {
    setProcuredItems([
      ...procuredItems,
      {
        item_id: "",
        unit_price: "",
        unit_cost: "",
        quantity: "",
        total_cost: "",
      },
    ]);
  };

  const removeInvoiceItem = (index) => {
    const newInvoiceItems = procuredItems.filter((_, i) => i !== index);
    setProcuredItems(newInvoiceItems);
  };

  const resetForm = () => {
    if (isEditing) {
      fetchExistingProcurement();
    } else {
      setProcuredItems([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (procuredItems.length === 0) {
      setIsInfoModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setIsLoading(true);
    submitData({
      apiUrl: isEditing
        ? "/api/inventory/updateprocurement"
        : "/api/inventory/addprocurement",
      data: {
        user_id: session?.user?.id,
        supplier_id: selectedSupplierId,
        selected_date: selectedDate,
        procured_items: procuredItems,
      },
      successMessage: isEditing
        ? "Procurement updated successfully"
        : "Procured items added successfully",
      errorMessage: isEditing
        ? "Failed to update procurement"
        : "Failed to add procured items",
      resetForm: () => {
        resetForm();
        if (!isEditing) {
          setSelectedSupplierId("");
          setSelectedDate("");
        }
      },
      onSuccess: (result) => {
        // Any additional actions on success
      },
      onError: (error) => {
        // Any additional actions on error
      },
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingPage />;
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
        title={isEditing ? "Update Procurement?" : "Add New Procurement?"}
        message={
          isEditing
            ? "Are you sure you want to update this procurement?"
            : "Are you sure you want to add these procured items?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="Please add at least one procured item before submitting."
      />

      <Addeditprocurementpage
        itemsData={itemsData}
        suppliersData={suppliersData}
        selectedSupplierId={selectedSupplierId}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        handleSupplierChange={handleSupplierChange}
        procuredItems={procuredItems}
        handleSubmit={handleSubmit}
        handleInvoiceChange={handleInvoiceChange}
        addInvoiceItem={addInvoiceItem}
        removeInvoiceItem={removeInvoiceItem}
        resetForm={resetForm}
        onCancel={onCancel}
        isEditing={isEditing}
        readonly={readonly}
      />
    </>
  );
};

export default Addeditprocurement;
