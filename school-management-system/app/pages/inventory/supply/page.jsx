"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaBox,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaListAlt,
  FaWarehouse,
  FaSearch,
} from "react-icons/fa";
// import { Tab } from "@headlessui/react";
import DeleteUser from "../../../components/deleteuser";
import StatCard from "../../../components/statcard";
import Modal from "../../../components/modal/modal";
import CustomTable from "../../../components/listtableForm";
import { fetchData } from "../../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";
import Addeditprocurement from "../stock/addeditprocurement/addprocurement";
import ItemMovement from "./itemmovement/itemmovement";
import ClassSupplyManagement from "./itemsupplypage/classsupplypage";
import ReceiveMovedItem from "./receivemoveditem/receivemoveditem";
import AddeditClassitems from "../items/addEditClassItem/addclassitem";

const ItemManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [items, setItems] = useState([]);
  const [movedItems, setMovedItems] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDeleteAuthorised, setIsDeleteAuthorised] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [searchMovedQuery, setSearchMovedQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const headerNames = [
    "ID",
    "Item Name",
    "Class Name",
    "Student Name",
    "Semester",
    "Quantity",
    "Supplier",
    "Date",
  ];

  function extractItemsData(items) {
    return items?.map((item) => ({
      id: item.supply_id,
      item_name: item.item_name,
      class_name: item.class_name,
      student_name: item.student_name,
      semester_name: item.semester_name,
      quantity: item.quantity,
      // unit_price: item.unit_price,
      supplier: item.staff_name,
      supplied_at: item.supplied_at,
    }));
  }

  function extractProcurementData(items) {
    return items?.map((item) => ({
      id: item.id,
      name: item.name,
      item_name: item.item_name,
      quantity: item.quantity,
      supplied_at: item.supplied_at,
      status: item.status,
      movement_type: item.movement_type,
      // supplied_at: item.supplied_at,
    }));
  }
  const procurementheaderNames = [
    "Supply ID",
    "Recipient Name",
    "Item Name",
    "Quantity",
    "Supplied at",
    "Item Status",
    "Movement Type",
  ];

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["manage supply"];

    console.log("session?.user?.role", session?.user?.role);
    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      session?.user?.role === "admin" ||
      session?.user?.roles?.some((role) => authorizedRoles.includes(role))
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session, status]);

  // useEffect(() => {
  //   const authorizedRoles = ["admin", "head teacher"];
  //   const authorizedPermissions = ["view supply items"];

  //   if (
  //     session?.user?.permissions?.some((permission) =>
  //       authorizedPermissions.includes(permission)
  //     )
  //   ) {
  //     setIsDeleteAuthorised(true);
  //   } else {
  //     setIsDeleteAuthorised(false);
  //   }
  // }, [session, status]);

  useEffect(() => {
    setIsLoading(true);
    fetchSupplyItems();
    fetchLowStockItems();
    fetchMovedItems();
    setIsLoading(false);
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSupplyItems(searchQuery);
  };

  const handleMoveItemSearchInputChange = (e) => {
    setSearchMovedQuery(e.target.value);
    fetchMovedItems(searchMovedQuery);
  };

  const handleMoveItem = async (item_id) => {
    let itemdata;
    try {
      if (typeof item_id === "number" || typeof item_id === "string") {
        itemdata = items.filter((item) => item.item_id === item_id);
        console.log("itemdata4455", itemdata, item_id);
      }

      setModalContent(
        <div>
          <ItemMovement
            onCancel={() => {
              setShowModal(false);
              fetchSupplyItems();
              fetchData();
            }}
            item={itemdata}
          />
          {/* ) : (
            <Loadingpage />
          )} */}
        </div>
      );
      setShowModal(true);
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      // setShowModal(true);
      setIsLoading(false);
    }
  };

  const handleReceiveMovedItem = async (supply_id) => {
    try {
      const itemdata = movedItems.filter((item) => item.id === supply_id);
      console.log("itemdata", itemdata);

      setModalContent(
        <div>
          {/* {!isLoading ? ( */}
          <ReceiveMovedItem
            id={supply_id}
            itemData={itemdata[0]}
            onCancel={() => {
              setShowModal(false);
              fetchSupplyItems();
            }}
          />
          {/* ) : (
            <Loadingpage />
          )} */}
        </div>
      );
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      // setShowModal(true);
      setIsLoading(false);
    }
  };

  const fetchMovedItems = async (searchQuery1 = "") => {
    // setLoading(true);

    let url = "/api/inventory/getallitemmovements";
    if (searchQuery1.trim() !== "") {
      url += `?query=${encodeURIComponent(searchQuery1)}`;
    }
    const data = await fetchData(url, "", false);

    setMovedItems(data);
    setLoading(false);
  };

  const fetchLowStockItems = async (searchQuery1 = "") => {
    setIsLoading(false);
    // Fetch items from API
    try {
      let url = "/api/inventory/getlowstockItems";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      // console.log("data?.length", data?.length);
      setLowStockItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupplyItems = async (searchQuery1 = "") => {
    // Fetch items from API

    try {
      let url = "/api/inventory/getallitemsupplies";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      setItems(data);
      setTableItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplyClassItems = () => {
    setModalContent(
      <ClassSupplyManagement
        onCancel={() => setShowModal(false)}
        itemsData={tableItems}
        isReadOnly={false}
      />
    );
    setShowModal(true);
  };

  const handleViewSupplyClassItems = () => {
    setModalContent(
      <AddeditClassitems
        onCancel={() => setShowModal(false)}
        isreadonly={true}
      />
    );
    setShowModal(true);
  };

  const handleDeleteItem = async (item_id) => {
    if (!isAuthorised) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised to perform this action
        </div>
      );
      setShowModal(true);
    } else {
      try {
        setIsLoading(true);
        setModalContent(
          <div>
            <DeleteUser
              userData={item_id}
              onClose={() => setShowModal(false)}
              onDelete={async () => {
                const toastId2 = toast.loading("Processing your request...");

                const subjectdata = {
                  user_id: session.user?.id,
                };

                try {
                  const response = await fetch(
                    `/api/inventory/deleteitem/${item_id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(subjectdata),
                    }
                  );

                  if (!response.ok) {
                    // throw new Error(
                    //   id ? "Failed to delete item" : "Failed to add item"
                    // );

                    toast.update(toastId2, {
                      render: response?.error || "Failed to delete item!!.",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }

                  // Add API call to delete item
                  fetchSupplyItems();
                  // toast.success("item deleted successfully...");
                  toast.update(toastId2, {
                    render: response?.message || "item deleted successfully...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  setShowModal(false);
                  // alert("item deleted successfully!");
                } catch (error) {
                  console.error("Error deleting item:", error);
                  // toast.error("An error occurred. Please try again.");
                  toast.update(toastId2, {
                    render: error || "An error occurred. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                  });

                  // alert("An error occurred. Please try again.");
                }
              }}
            />
          </div>
        );
      } catch (error) {
        console.log(error);
      } finally {
        setShowModal(true);
        setIsLoading(false);
      }
    }
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
        You are not authorised "manage supply" to be on this page
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">Item Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<FaBox className="text-2xl" />}
          title="Total Stock Items"
          value={items?.length}
        />
        <StatCard
          icon={<FaWarehouse className="text-2xl" />}
          title="Low Stock Items"
          value={lowStockItems?.length}
        />
        {/* <StatCard
          icon={<FaListAlt className="text-2xl" />}
          title="Categories"
          value={itemStats?.categories}
        /> */}
        <StatCard
          icon={<FaBox className="text-2xl" />}
          title="Out of Stock"
          value={tableItems?.length - items?.length}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700 mb-4 sm:mb-0">
            Supply History
          </h2>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleSupplyClassItems}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Supply Items
            </button>

            <button
              onClick={handleViewSupplyClassItems}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> View Supply Items
            </button>
          </div>
        </div>

        <div className="mt-6 text-cyan-700">
          {loading ? (
            <div className="text-cyan-700">
              <LoadingPage />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <CustomTable
                data={extractItemsData(items)}
                headerNames={headerNames}
                maxTableHeight="calc(100vh - 400px)"
                height="auto"
                searchPlaceholder="Search by item name or semester name or class name student name or supplier name"
                handleEdit={handleMoveItem}
                displaySearchBar={true}
                searchTerm={searchQuery}
                handleSearch={handleSearchInputChange}
                displayDetailsBtn={false}
                editTitle="Edit item"
                displayActions={false}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700 mb-4 sm:mb-0">
            Items Movement History
          </h2>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleMoveItem}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Move Items
            </button>
          </div>
        </div>

        <div className="mt-6 text-cyan-700">
          {loading ? (
            <div className="text-cyan-700">
              <LoadingPage />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <CustomTable
                data={extractProcurementData(movedItems)}
                headerNames={procurementheaderNames}
                maxTableHeight="calc(100vh - 400px)"
                height="auto"
                searchPlaceholder="Search with recipient name or item name"
                handleDelete={handleDeleteItem}
                displaySearchBar={true}
                searchTerm={searchMovedQuery}
                handleSearch={handleMoveItemSearchInputChange}
                handleEdit={handleReceiveMovedItem}
                displayDetailsBtn={false}
                displayDelBtn={false}
                editTitle="Receive the item with id: "
                displayActions={false}
              />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default ItemManagement;
