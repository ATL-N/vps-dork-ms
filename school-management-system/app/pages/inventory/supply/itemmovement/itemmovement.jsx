"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ItemMovementPage from "../../../../components/inventorycomponent/itemmovementpage";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../../components/generalLoadingpage";
import { submitData } from "../../../../config/configFile";
import { fetchData } from "../../../../config/configFile";

const ItemMovement = ({ onCancel }) => {
  const { data: session, status } = useSession();

  const initialState = {
    staff_id: "",
    recipient_name: "",
    recipient_phone: null,
    comments: null,
    movement_type: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [supplyType, setSupplyType] = useState("");
  const [selectedstaffId, setSelectedstaffId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [itemList, setItemList] = useState([]);
  const [class_items, setClass_items] = useState([]);
  const [itemMovement, setItemMovement] = useState();
  const [staffData, setStaffData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClassandSemester();

    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activesem = session?.user?.activeSemester?.semester_id;
      setIsLoading(true);
      setIsLoading(false);
    }
  }, [status, session]);

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
    // Update selectedItemIds whenever inventoryItems changes
    const newSelectedItemIds = new Set(
      inventoryItems.map((item) => item.item_id).filter(Boolean)
    );
    setSelectedItemIds(newSelectedItemIds);
  }, [inventoryItems]);

  useEffect(() => {
    if (itemMovement) {
      // console.log("semesterdata", itemMovement);
      const initialFormData = {
        semester_id: id,
        semester_name: itemMovement.semester_name,
        status: itemMovement.status,
        start_date: itemMovement.start_date,
        end_date: itemMovement.end_date,
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [itemMovement]);

  const fetchClassandSemester = async () => {
    setIsLoading(true);
    console.log("fetching all the items");
    try {
      const [staffdata, items] = await Promise.all([
        // fetchData("/api/semester/all", "semester", false),
        fetchData("/api/staff/all", "item", false),
        fetchData("/api/inventory/getitems/", "item", false),
      ]);
      setItemList(items);
      setStaffData(staffdata);
      // setSemesterData(semesterdata);
      // console.log("procurements", staffdata);
    } catch (err) {
      setError(err.message);
      console.log("error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    console.log("formData", formData);
  };

  const handlestaffChange = (e) => {
    const staff_id = e.target.value;
    setSelectedstaffId(staff_id);
    console.log(staff_id);
    // setInventoryItems([]);
    // setSelectedItemIds(new Set());
  };

  const handleInvoiceChange = (index, field, value) => {
    setInventoryItems((prevItems) => {
      const newItems = [...prevItems];
      if (field === "item_id") {
        // Remove the old item_id from selectedItemIds
        setSelectedItemIds((prevIds) => {
          const newIds = new Set(prevIds);
          newIds.delete(newItems[index].item_id);
          return newIds;
        });
        console.log(
          "selectedItemIds",
          selectedItemIds,
          selectedItemIds.has(value)
        );

        const selectedItem = itemList.find(
          (item) => item.item_id === parseInt(value)
        );
        if (selectedItem) {
          newItems[index] = {
            ...newItems[index],
            [field]: value,
            unit_price: selectedItem.unit_price,
          };
        } else {
          newItems[index] = {
            ...newItems[index],
            [field]: value,
            unit_price: "",
          };
        }

        // Add the new item_id to selectedItemIds
        setSelectedItemIds((prevIds) => new Set(prevIds).add(value));
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return newItems;
    });
  };

  const addInvoiceItem = () => {
    setInventoryItems((prevItems) => [
      ...prevItems,
      {
        item_id: "",
        quantity: "",
        item_status: "",

        // unit_price: "",
        // total_price: "",
      },
    ]);
  };

  const removeInvoiceItem = (index) => {
    setInventoryItems((prevItems) => {
      const newItems = prevItems.filter((_, i) => i !== index);
      const removedItemId = prevItems[index].item_id;

      // Remove the item_id from selectedItemIds
      setSelectedItemIds((prevIds) => {
        const newIds = new Set(prevIds);
        newIds.delete(removedItemId);
        return newIds;
      });

      return newItems;
    });
  };

  const resetForm = () => {
    setInventoryItems([]);
    setSelectedItemIds(new Set());
  };

  const checkDuplicateItems = () => {
    const itemIds = inventoryItems.map((item) => item.item_id);
    const duplicates = itemIds.filter(
      (id, index) => itemIds.indexOf(id) !== index
    );

    if (duplicates.length > 0) {
      const duplicateNames = duplicates.map(
        (id) =>
          itemList.find((item) => item.item_id === parseInt(id))?.item_name ||
          "Unknown Item"
      );
      toast.error(
        `Duplicate items found: ${duplicateNames.join(
          ", "
        )}. Please remove duplicates before submitting.`
      );
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inventoryItems.length === 0) {
      setIsInfoModalOpen(true);
      return;
    }

    if (checkDuplicateItems()) {
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setIsLoading(true);
    submitData({
      apiUrl: "/api/inventory/additemmovement",
      data: {
        formData: formData,
        user_id: session.user?.id,
        inventory_items: inventoryItems,
      },
      // successMessage: "Supply given out successfully",
      // errorMessage: "Failed to add class items",

      // onSuccess: (result) => {
      //   resetForm();
      //   setSelectedstaffId("");
      // },
      // onError: (error) => {
      //   // Any additional actions on error
      // },
    });
    setIsLoading(false);
  };

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
        title="Add Class items?"
        message="Are you sure you want to add these new items?"
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="Please add at least one class item before submitting."
      />

      {staffData?.length > 0 ? (
        <ItemMovementPage
          staffData={staffData}
          semesterData={semesterData}
          itemsData={itemList}
          supplyType={supplyType}
          selectedstaffId={selectedstaffId}
          handlestaffChange={handlestaffChange}
          inventoryItems={inventoryItems}
          selectedItemIds={selectedItemIds}
          handleSubmit={handleSubmit}
          handleInvoiceChange={handleInvoiceChange}
          addInvoiceItem={addInvoiceItem}
          removeInvoiceItem={removeInvoiceItem}
          resetForm={resetForm}
          onCancel={onCancel}
          formData={formData}
          handleChange={handleChange}
        />
      ) : (
        <div>No Items found</div>
      )}
    </>
  );
};

export default ItemMovement;
