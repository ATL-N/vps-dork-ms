"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaBoxes,
  FaTruckLoading,
  FaWarehouse,
  FaUserTie,
  FaCartPlus,
  FaUserPlus,
  FaLaptopHouse,
} from "react-icons/fa";
import StatCard from "../../../components/statcard";
import Modal from "../../../components/modal/modal";
import Addedititems from "./additems/additems";
import AddeditClassitems from "./addEditClassItem/addclassitem";
import Addeditsupplier from "./addsuppliers/addsuppliers";
// import StockMovement from "./stockmovement/page";
// import SupplyDistribution from "./supplydistribution/page";
import CustomTable from "../../../components/listtableForm";
import { fetchData } from "../../../config/configFile";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";
import DeleteUser from "../../../components/deleteuser";
import EditItem from "./editItem/edititem";

const InventoryManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [damagedItems, setDamagedItems] = useState([]);
  const [pendingProcurement, setPendingProcurement] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [isDelAuthorised, setIsDelAuthorised] = useState(true);
  const [searchSupplierQuery, setSearchSupplierQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [damagedQuery, setDamagedQuery] = useState("");
  const [lowStockQuery, setLowStockQuery] = useState("");
  const [pendingProcurementQuery, setPendingProcurementQuery] = useState("");

  function extractData(items) {
    return items?.map((item) => ({
      id: item.supplier_id,
      supplier_name: item.supplier_name,
      contact_name: item.contact_name,
      contact_phone: item.contact_phone,
      contact_email: item.contact_email,
      address: item.address,
      details: item.details,
    }));
  }

  function extractAllItemsData(items) {
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

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view items"];
    const authorizedPermissions2 = ["delete item"];

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

  // Fetch inventory items
  useEffect(() => {
    setIsLoading(true);

    fetchAllItems();
    fetchDamagedItems();
    fetchSuppliers();
    fetchLowStockItems();
    fetchItemsPendingProcurement();
    setIsLoading(false);
  }, []);

  const fetchAllItems = async (searchQuery1 = "") => {
    setIsLoading(false);
    // Fetch items from API
    try {
      let url = "/api/inventory/getitems";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      setInventoryItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDamagedItems = async (searchQuery1 = "") => {
    setIsLoading(false);
    // Fetch items from API
    try {
      let url = "/api/inventory/getitems";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      const filteredDamagedItems = data?.filter(
        (item) => item.status === "damaged"
      );
      setDamagedItems(filteredDamagedItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
      setLowStockItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemsPendingProcurement = async (searchQuery1 = "") => {
    setIsLoading(false);
    // Fetch items from API
    try {
      let url = "/api/inventory/getlowpendingprocurement";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      setPendingProcurement(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSupplier = (e) => {
    setSearchSupplierQuery(e.target.value);
    fetchSuppliers(searchSupplierQuery);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    fetchAllItems(searchQuery);
  };

  const handleDamageItemsSearch = (e) => {
    setDamagedQuery(e.target.value);
    fetchDamagedItems(damagedQuery);
  };

  const handleLowStockItemsSearch = (e) => {
    setLowStockQuery(e.target.value);
    fetchLowStockItems(lowStockQuery);
  };

  const handlePendingProcurementSearch = (e) => {
    setPendingProcurementQuery(e.target.value);
    fetchItemsPendingProcurement(pendingProcurementQuery);
  };

  const fetchSuppliers = async (searchQuery1 = "") => {
    // Fetch items from API

    try {
      let url = "/api/inventory/suppliers/get";
      if (searchQuery1.trim() !== "") {
        url += `?query=${encodeURIComponent(searchQuery1)}`;
      }
      const data = await fetchData(url, "", false);
      setPendingProcurement(data);

      // try {
      // const data = await fetchData("/api/inventory/suppliers/get", "", false);
      setSuppliersData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventoryHistory = async () => {
    // Fetch items from API
    try {
      const response = await fetch("/api/inventory/getinventories");
      if (!response.ok) throw new Error("Failed to fetch inventory items");
      const data = await response.json();
      setInventoryHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdditems = async () => {
    // setIsLoading(true);
    try {
      // const [semesterData, classData] = await Promise.all([
      //   fetchData("/api/semester/all", "semester"),
      //   fetchData("/api/classes/all", "item"),
      // ]);

      setModalContent(
        <div>
          {/* {!isLoading ? ( */}
          <Addedititems
            // classData={classData?.classes}
            // semesterData={semesterData}
            onCancel={() => {
              setShowModal(false);
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

  const handleAddClassItems = async () => {
    // setIsLoading(true);
    try {
      // const [itemsData] = await Promise.all([
      //   fetchData("/api/inventory/getinventories", "items"),
      // ]);

      setModalContent(
        <div>
          {/* {!isLoading ? ( */}
          <AddeditClassitems
            onCancel={() => {
              setShowModal(false);
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

  const handleEditItem = async (item_id) => {
    try {
      const itemdata = inventoryItems.filter(
        (item) => item.item_id === item_id
      );

      setModalContent(
        <div>
          {/* {!isLoading ? ( */}
          <EditItem
            id={item_id}
            itemData={itemdata[0]}
            onCancel={() => {
              setShowModal(false);
              fetchAllItems();
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

  const handleSupplyItem = async (item_id) => {
    try {
      const itemdata = suppliersData.filter(
        (item) => item.supplier_id === item_id
      );

      setModalContent(
        <div>
          {/* {!isLoading ? ( */}
          <Addeditsupplier
            id={item_id}
            supplierData={itemdata[0]}
            onCancel={() => {
              setShowModal(false);
              fetchSuppliers();
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

  const handleAddSupplier = () => {
    setModalContent(
      <Addeditsupplier
        onCancel={() => setShowModal(false)}
        onSave={() => {
          fetchAllItems();
          fetchSuppliers();
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleDeleteItem = async (item_id) => {
    if (
      !(
        session?.user?.role === "admin" ||
        session?.user?.permissions?.some(
          (permission) => permission === "delete item"
        )
      )
    ) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised "delete item" to perform this action
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
                  await fetchAllItems();
                  fetchDamagedItems();
                  fetchItemsPendingProcurement();
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

  const handleDeleteSupplier = async (supplier_id) => {
    if (
      !(
        session?.user?.role === "admin" ||
        session?.user?.permissions?.some(
          (permission) => permission === "delete item"
        )
      )
    ) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised "delete item" to perform this action
        </div>
      );
      setShowModal(true);
    } else {
      try {
        setIsLoading(true);
        setModalContent(
          <div>
            <DeleteUser
              userData={supplier_id}
              onClose={() => setShowModal(false)}
              onDelete={async () => {
                const toastId2 = toast.loading("Processing your request...");

                const subjectdata = {
                  user_id: session.user?.id,
                };

                try {
                  const response = await fetch(
                    `/api/inventory/deletesuppliers/${supplier_id}`,
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
                      render: response?.error || "Failed to delete Supplier!!.",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                    return;
                  }

                  // Add API call to delete Supplier
                  fetchSuppliers();
                  // toast.success("Supplier deleted successfully...");
                  toast.update(toastId2, {
                    render:
                      response?.message || "Supplier deleted successfully...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  setShowModal(false);
                  // alert("Supplier deleted successfully!");
                } catch (error) {
                  console.error("Error deleting Supplier:", error);
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
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "view items" to be on this page...!
      </div>
    );
  }

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Inventory Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<FaBoxes />}
          title="Total Items"
          value={inventoryItems?.length}
        />
        <StatCard
          icon={<FaUserTie />}
          title="Total Suppliers"
          value={suppliersData?.length}
        />
        <StatCard
          icon={<FaWarehouse />}
          title="Damaged Items"
          value={damagedItems?.length}
        />
        <StatCard
          icon={<FaWarehouse />}
          title="Low Stock Items"
          value={lowStockItems?.length}
        />
        <StatCard
          icon={<FaTruckLoading />}
          title="Pending Procurements"
          value={pendingProcurement?.length}
        />
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            All Items Wanted
          </h2>
          {/* <div className="flex"> */}
            <button
              onClick={handleAddClassItems}
              className="p-2 m-2 mr-4 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
            >
              <FaPlus className="mr-2" /> Assign Class Supplies
            </button>

            <button
              onClick={handleAdditems}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
            >
              <FaCartPlus className="mr-2" /> Add Item(s)
            </button>
          {/* </div> */}
        </div>
        <div className="overflow-x-auto">
          <CustomTable
            data={extractAllItemsData(inventoryItems)}
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
            displayActions={true}
            displaySearchBar={true}
            searchTerm={searchQuery}
            displayDetailsBtn={false}
            handleSearch={handleSearchInputChange}
            searchPlaceholder="Search with item name or category"
            handleDelete={handleDeleteItem}
            handleEdit={handleEditItem}
            displayDelBtn={isDelAuthorised}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">Damaged Items</h2>
        </div>
        <div className="overflow-x-auto">
          <CustomTable
            data={extractAllItemsData(damagedItems)}
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
            displayActions={true}
            displaySearchBar={true}
            searchTerm={damagedQuery}
            displayDetailsBtn={false}
            handleSearch={handleDamageItemsSearch}
            searchPlaceholder="Search with item name or category"
            handleDelete={handleDeleteItem}
            handleEdit={handleEditItem}
            displayDelBtn={isDelAuthorised}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            Low Stock Items
          </h2>
        </div>
        <div className="overflow-x-auto">
          <CustomTable
            data={extractAllItemsData(lowStockItems)}
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
            displayActions={false}
            displaySearchBar={true}
            searchTerm={lowStockQuery}
            displayDetailsBtn={false}
            handleSearch={handleLowStockItemsSearch}
            searchPlaceholder="Search with item name or category"
            handleDelete={handleDeleteItem}
            displayDelBtn={isDelAuthorised}
          />
        </div>
      </div>

      {/* <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            Items Not Procured At all
          </h2>
        </div>
        <div className="overflow-x-auto">
          <CustomTable
            data={extractAllItemsData(pendingProcurement)}
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
            displayActions={false}
            displaySearchBar={true}
            searchTerm={pendingProcurementQuery}
            displayDetailsBtn={false}
            handleSearch={handlePendingProcurementSearch}
            searchPlaceholder="Search with item name or category"
          />
        </div>
      </div> */}

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            Suppliers Data
          </h2>
          <div className="flex">
            <button
              onClick={handleAddSupplier}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
            >
              <FaUserPlus className="mr-2" /> Add Supplier
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {!isLoading ? (
            <CustomTable
              data={extractData(suppliersData)}
              headerNames={[
                "ID",
                "Supplier Name",
                "Contact Name",
                "Contact Phone",
                "Contact Email",
                "Address",
                "Comment",
              ]}
              displayDetailsBtn={false}
              displaySearchBar={true}
              handleEdit={handleSupplyItem}
              searchTerm={searchSupplierQuery}
              handleSearch={handleSearchSupplier}
              searchPlaceholder="Search with supplier name or contact name or email or comment or address"
              handleDelete={handleDeleteSupplier}
              displayDelBtn={isDelAuthorised}
            />
          ) : (
            <Loadingpage />
          )}
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default InventoryManagement;
