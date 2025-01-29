"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddeditClassitemspage from "../../../../components/inventorycomponent/addeditclassitemspage";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../../components/generalLoadingpage";
import { submitData } from "../../../../config/configFile";
import { fetchData } from "../../../../config/configFile";

const AddeditClassitems = ({ onCancel, isreadonly = false }) => {
  const { data: session, status } = useSession();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [itemList, setItemList] = useState([]);
  const [class_items, setClass_items] = useState([]);
  const [selectedItem, setSelectedItem] = useState();
  const [classData, setClassData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClassandSemester();

    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activesem = session?.user?.activeSemester?.semester_id;
      // setIsLoading(true);
      // setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["assign class items"];

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
  }, [session, status]);

  useEffect(() => {
    // Update selectedItemIds whenever inventoryItems changes
    const newSelectedItemIds = new Set(
      inventoryItems?.map((item) => item.item_id).filter(Boolean)
    );
    setSelectedItemIds(newSelectedItemIds);
  }, [inventoryItems]);

  useEffect(() => {
    if (selectedClassId && selectedSemesterId) {
      fetchclassinventoryItems(selectedClassId, selectedSemesterId);
    }
  }, [selectedClassId, selectedSemesterId]);

  const fetchclassinventoryItems = async (selectedclass, selectedsemester) => {
    setLoading(true);
    try {
      const data = await fetchData(
        `/api/inventory/getclassitems?class_id=${selectedclass}&semester_id=${selectedsemester}`,
        "",
        false
      );
      if (data?.items.length > 0) {
        setInventoryItems(data?.items);
      }
    } catch (err) {
      console.log("Error incured:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassandSemester = async () => {
    setIsLoading(true);
    console.log("fetching all the items");
    try {
      const [semesterdata, classdata, items] = await Promise.all([
        fetchData("/api/semester/all", "semester", false),
        fetchData("/api/classes/all", "item", false),
        fetchData("/api/inventory/getitems/", "item", false),
      ]);
      setItemList(items);
      setClassData(classdata?.classes);
      setSemesterData(semesterdata);
    } catch (err) {
      setError(err.message);
      console.log("error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setInventoryItems([]);
    setSelectedItemIds(new Set());
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setSelectedSemesterId(semesterId);
    setInventoryItems([]);
    setSelectedItemIds(new Set());
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
        quantity_per_student: "",
        unit_price: "",
        total_price: "",
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
    console.log("inventoryItems", inventoryItems);
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
      apiUrl: "/api/inventory/addiclasssemesteritems",
      data: {
        class_id: selectedClassId,
        semester_id: selectedSemesterId,
        user_id: session.user?.id,
        inventory_items: inventoryItems,
      },
      successMessage: "class added successfully",
      errorMessage: "Failed to add class items",

      onSuccess: (result) => {
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
        title="Add Class items?"
        message="Are you sure you want to add these new items?"
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="Please add at least one class item before submitting."
      />

      {classData?.length > 0 ? (
        <>
          {!loading ? (
            <AddeditClassitemspage
              classData={classData}
              semesterData={semesterData}
              itemsData={itemList}
              selectedClassId={selectedClassId}
              selectedSemesterId={selectedSemesterId}
              handleClassChange={handleClassChange}
              handleSemesterChange={handleSemesterChange}
              inventoryItems={inventoryItems}
              selectedItemIds={selectedItemIds}
              handleSubmit={handleSubmit}
              handleInvoiceChange={handleInvoiceChange}
              addInvoiceItem={addInvoiceItem}
              removeInvoiceItem={removeInvoiceItem}
              resetForm={resetForm}
              onCancel={onCancel}
              isreadonly={isreadonly}
            />
          ) : (
            <div>Loading...</div>
          )}
        </>
      ) : (
        <div>No items found in the system. Add items to the system before you can assign an item</div>
      )}
    </>
  );
};

export default AddeditClassitems;
