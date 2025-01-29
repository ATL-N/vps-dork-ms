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
import Addeditprocurement from "./addeditprocurement/addprocurement";
import EditItem from "../items/editItem/edititem";

const ItemManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [items, setItems] = useState([]);
  const [procurementItems, setProcurementItems] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDeleteAuthorised, setIsDeleteAuthorised] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [searchProcurementQuery, setSearchProcurementQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDelAuthorised, setIsDelAuthorised] = useState(true);

  const headerNames = ["ID", "Name", "Category", "Quantity", "Unit"];

  function extractItemsData(items) {
    return items?.map((item) => ({
      id: item.item_id,
      item_name: item.item_name,
      category: item.category,
      unit_price: item.unit_price,
      quantity_desired: item.quantity_desired,
      quantity_available: item.quantity_available,
      restock_level: item.restock_level,
      status: item.status,
    }));
  }

  function extractProcurementData(items) {
    return items?.map((item) => ({
      supplier_id: item.supplier_id,
      supplier_name: item.supplier_name,
      procurement_date: item.procurement_date,
      group_total_cost: item.group_total_cost,
    }));
  }
  const procurementheaderNames = [
    "Supplier ID",
    "Supplier Name",
    "Procurement Date",
    "Total Cost",
  ];

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view stock items"];
    const authorizedPermissions2 = ["delete supply items"];

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

    if (session?.user?.roles?.includes("admin")) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions2.includes(permission)
      ) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsDelAuthorised(true);
    } else {
      setIsDelAuthorised(false);
    }
  }, [session, status]);

  // useEffect(() => {
  //   const authorizedRoles = ["admin"];
  //   const authorizedPermissions = ["edit procurements"];

  //   if (
  //     session?.user?.permissions?.some((permission) =>
  //       authorizedPermissions.includes(permission)
  //     ) ||
  //     authorizedRoles.includes(session?.user?.role)
  //   ) {
  //     setIsDeleteAuthorised(true);
  //   } else {
  //     setIsDeleteAuthorised(false);
  //   }
  // }, [session, status]);

  useEffect(() => {
    setIsLoading(true);
    fetchStockItems();
    fetchLowStockItems();
    fetchProcurementItems();
    setIsLoading(false);
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchStockItems(searchQuery);
  };

  const handleEditItem = async (item_id) => {
    try {
      const itemdata = items.filter((item) => item.item_id === item_id);
      console.log("itemdata", itemdata);

      setModalContent(
        <div>
          {/* {!isLoading ? ( */}
          <EditItem
            id={item_id}
            itemData={itemdata[0]}
            onCancel={() => {
              setShowModal(false);
              fetchStockItems();
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
      setShowModal(true);
      setIsLoading(false);
    }
  };

  const fetchProcurementItems = async (searchQuery1 = "") => {
    // setLoading(true);

    let url = "/api/inventory/getsupplierprocurements";
    if (searchQuery1.trim() !== "") {
      url += `?query=${encodeURIComponent(searchQuery1)}`;
    }
    const data = await fetchData(url, "", false);

    setProcurementItems(data);
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

  const fetchStockItems = async (searchQuery1 = "") => {
    // Fetch items from API

    try {
      let url = "/api/inventory/getitems";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      const filteredDamagedItems = data?.filter(
        (item) => item.quantity_available > 0
      );

      console.log("items data", data, filteredDamagedItems);
      setItems(filteredDamagedItems);
      setTableItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProcurement = () => {
    setModalContent(
      <Addeditprocurement
        onCancel={() => setShowModal(false)}
        itemsData={tableItems}
      />
    );
    setShowModal(true);
  };

  const handleProcurementSearch = (e) => {
    setSearchProcurementQuery(e.target.value);
    fetchProcurementItems(searchProcurementQuery);
  };

  const handleProcurementDetails = (supplier_id, supply_date) => {
    console.log("Procurement details", supplier_id, supply_date);
    setModalContent(
      <Addeditprocurement
        onCancel={() => setShowModal(false)}
        itemsData={tableItems}
        selected_date={supply_date}
        supplier_id={supplier_id}
        readonly={true}
      />
    );
    setShowModal(true);
  };

  const handleEditProcurementDetails = (supplier_id, supply_date) => {
    console.log("Procurement details", supplier_id, supply_date);
    setModalContent(
      <Addeditprocurement
        onCancel={() => setShowModal(false)}
        itemsData={tableItems}
        selected_date={supply_date}
        supplier_id={supplier_id}
        readonly={false}
      />
    );
    setShowModal(true);
  };

  const handleDeleteItem = async (item_id) => {
    if (!isAuthorised) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised "view stock items" to perform this action
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
                  fetchStockItems();
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
        You are not authorised to be on this page
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
            Item Management
          </h2>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleAddProcurement}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add New Procurements
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
                headerNames={[
                  "ID",
                  "Item Name",
                  "Category",
                  "Unit Price",
                  "Desired Quantity",
                  "Available Quantity",
                  "Re-Order level",
                  "status",
                ]}
                maxTableHeight="calc(100vh - 400px)"
                height="auto"
                searchPlaceholder="Search by name or category"
                handleEdit={handleEditItem}
                handleDelete={handleDeleteItem}
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
            Procurement History
          </h2>
        </div>
        <div className="mb-4 shadow ">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by supplier name"
              value={searchProcurementQuery}
              onChange={handleProcurementSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-cyan-700"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="tableWrap height-45vh">
          {extractProcurementData(procurementItems)?.length > 0 ? (
            <table className={`overflow-y-scroll uppercase table-auto`}>
              <thead className="header-overlay ">
                <tr className=" px-6 py-3 text-xs font-medium text-white text-center uppercase tracking-wider">
                  {procurementheaderNames?.map((header, index) => (
                    <th key={index} title={header} className="bg-cyan-700 p-4">
                      {header}
                    </th>
                  ))}
                  <th className="text-left pl-4 bg-cyan-700">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`bg-white divide-y divide-gray-200 text-cyan-800  overflow-scroll `}
              >
                {extractProcurementData(procurementItems)?.map(
                  (item, index) => {
                    return (
                      <>
                        <tr
                          key={index}
                          // title={item}
                          className={`${
                            index % 2 === 0 ? "bg-gray-100" : ""
                          }  hover:bg-cyan-50 text-center`}
                        >
                          {Object.values(item).map((value, colIndex) => {
                            // console.log("value", item);
                            return (
                              <td
                                key={colIndex}
                                title={value}
                                className={`border px-6 py-4 whitespace-nowrap`}
                              >
                                {typeof value === "object" && value !== null ? (
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 relative">
                                      <Image
                                        src={
                                          value.src ||
                                          value.image_details ||
                                          "/default-image.jpg"
                                        }
                                        alt=""
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-full"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  value?.toString() || ""
                                )}
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 whitespace-nowrap text-lg font-medium flex text-right">
                            {isDeleteAuthorised && (
                              <button
                                onClick={() =>
                                  handleEditProcurementDetails(
                                    item.supplier_id,
                                    item.procurement_date
                                  )
                                }
                                className="mr-6 text-xl grid text-cyan-900 hover:text-cyan-500 hover:bg-white"
                                title={`Edit procurements made on ${item.procurement_date} by ${item.supplier_name}`}
                              >
                                <FaEdit />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleProcurementDetails(
                                  item.supplier_id,
                                  item.procurement_date
                                )
                              }
                              className="mr-6 text-xl grid text-cyan-900 hover:text-cyan-500 hover:bg-white"
                              title={`View the details of items supplied by${item.supplier_name} on ${item.procurement_date} `}
                            >
                              <FaInfoCircle />
                            </button>
                            {/* 
                            <button
                              onClick={() => handleEvaluation(item.id)}
                              className="mr-6 text-xl grid text-green-500 hover:text-green-900 hover:bg-white"
                              // title={`${evalTitle} ${item.id}`}
                            >
                              <FaListAlt />
                            </button> */}
                          </td>
                        </tr>
                        {/* <tr key="print-row" className="bg-gray-100 text-right"></tr> */}
                      </>
                    );
                  }
                )}
              </tbody>
            </table>
          ) : (
            <div className="text-cyan-700">No data found</div>
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
