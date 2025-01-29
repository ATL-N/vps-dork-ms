"use client";
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaBoxes,
  FaTruckLoading,
  FaWarehouse,
  FaUserTie,
} from "react-icons/fa";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import Addeditinventoryitem from "./addEditInventoryItem/addinventoryitem";
import Addeditsupplier from "./items/addsuppliers/addsuppliers";
import Addeditprocurement from "./stock/addeditprocurement/addprocurement";
import StockMovement from "./supply/stockmovement/stockmovement";
import SupplyDistribution from "./supply/page";
import CustomTable from "../../components/listtableForm";
import { fetchData } from "../../config/configFile";
import { useSession } from "next-auth/react";
import Loadingpage from "../../components/Loadingpage";

const InventoryManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [procurementHistory, setProcurementHistory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(true);

  function extractData(items) {
    return items.map((item) => ({
      id: item.procument_id,
      inventory_name: item.inventory_name,
      supplier_name: item.supplier_name,
      unit_cost: item.unit_cost,
      quantity: item.quantity,
      total_cost: item.total_cost,
      procurement_date: item.procurement_date,
      received_by: `${item.first_name.trim()} ${item.last_name.trim()}`,
    }));
  }

  function extractInvntoryForClassData(items) {
    return items.map((item) => ({
      id: item.procument_id,
      inventory_name: item.inventory_name,
      supplier_name: item.supplier_name,
      unit_cost: item.unit_cost,
      quantity: item.quantity,
      total_cost: item.total_cost,
      procurement_date: item.procurement_date,
      received_by: `${item.first_name.trim()} ${item.last_name.trim()}`,
    }));
  }

  useEffect(() => {
     const authorizedRoles = ["admin"];
     const authorizedPermissions = ["view inventory"];

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

    // console.log("session roles", session?.user?.roles[0]);
  }, [session, status]);

  // Fetch inventory items
  useEffect(() => {
    setIsLoading(true);

    fetchInventoryItems();
    fetchProcurements();
    setIsLoading(false);
  }, []);

  const fetchInventoryItems = async () => {
    setIsLoading(true);
    // Fetch items from API
    try {
      const response = await fetch("/api/inventory/getprocurements");
      if (!response.ok) throw new Error("Failed to fetch inventory items");
      const data = await response.json();
      setInventoryItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProcurements = async () => {
    // Fetch items from API
    try {
      const response = await fetch("/api/inventory/getprocurementsHistory");
      if (!response.ok) throw new Error("Failed to fetch inventory items");
      const data = await response.json();
      setProcurementHistory(data);
      console.log("procurements", data);
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
      console.log("procurements", data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInventoryitem = async () => {
    setIsLoading(true);
    try {
      const [semesterData, classData] = await Promise.all([
        fetchData("/api/semester/all", "semester"),
        fetchData("/api/classes/all", "staff"),
      ]);

      setModalContent(
        <div>
          {/* {!isLoading ? */}
          <Addeditinventoryitem
            classData={classData?.classes}
            semesterData={semesterData}
            onCancel={() => {
              setShowModal(false);
            }}
          />
          {/* : <Loadingpage />
    } */}
        </div>
      );
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
      setShowModal(true);
      setIsLoading(false);
    }
  };

  const handleAddProcurement = async () => {
    setIsLoading(true);
    try {
      const [itemsData, suppliersData] = await Promise.all([
        fetchData("/api/inventory/getinventories", "items"),
        fetchData("/api/inventory/suppliers/get", "suppliers"),
      ]);

      setModalContent(
        <div>
          {/* {!isLoading ? ( */}
          <Addeditprocurement
            itemsData={itemsData}
            suppliersData={suppliersData}
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

  // const handleAddProcurement = () => {
  //   setModalContent(
  //     <Addeditsupplier
  //       onClose={() => setShowModal(false)}
  //       onSave={() => {
  //         fetchInventoryItems();
  //         setShowModal(false);
  //       }}
  //     />
  //   );
  //   setShowModal(true);
  // };

  const handleAddSupplier = () => {
    setModalContent(
      <Addeditsupplier
        onClose={() => setShowModal(false)}
        onSave={() => {
          fetchInventoryItems();
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleStockMovement = () => {
    setModalContent(
      <StockMovement
        onClose={() => setShowModal(false)}
        onSave={() => {
          fetchInventoryItems();
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleSupplyDistribution = () => {
    setModalContent(
      <SupplyDistribution
        onClose={() => setShowModal(false)}
        onSave={() => {
          fetchInventoryItems();
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  if (status === "loading" || isLoading) {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page
      </div>
    );
  }

  return (
    <div className="pb-16 text-cyan-600">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Inventory Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaBoxes />}
          title="Total Items"
          value={inventoryItems.length}
        />
        <StatCard icon={<FaUserTie />} title="Total Suppliers" value={5} />
        <StatCard icon={<FaWarehouse />} title="Low Stock Items" value={60} />
        <StatCard
          icon={<FaTruckLoading />}
          title="Pending Procurements"
          value={45}
        />
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            Inventory In Stock
          </h2>
          <div className="flex">
            <button
              onClick={handleAddProcurement}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center"
            >
              <FaTruckLoading className="mr-2" /> Add Procurement Made
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <CustomTable
            data={inventoryItems}
            headerNames={["Item Name", "Quantity", "Supplier", "Last Updated"]}
            displayActions={false}
            displaySearchBar={false}
            // handleDelete={/* delete item function */}
            // handleEdit={}
            // handleDetails={/* view item details function */}
          />
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700">
            Procurement History
          </h2>
          <div className="flex">
            <button
              onClick={handleAddInventoryitem}
              className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-600 flex items-center mr-2"
            >
              <FaPlus className="mr-2" /> Add New Class Item
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {!isLoading ? (
            <CustomTable
              data={extractData(procurementHistory)}
              headerNames={[
                "ID",
                "Item Name",
                "Supplier",
                "Unit cost",
                "Quantity",
                "total cost",
                "Procurement Date",
                "receipient",
              ]}
              displaySearchBar={false}
              // handleDelete={/* delete item function */}
              // handleEdit={}
              // handleDetails={/* view item details function */}
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
