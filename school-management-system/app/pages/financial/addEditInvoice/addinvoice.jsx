"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Addeditinvoicepage from "../../../components/financialcomponent/addeditinvoicepage";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";
import { submitData } from "../../../config/configFile";
import { fetchData } from "../../../config/configFile";

const Addeditinvoice = ({ classData, semesterData, onCancel }) => {
  const { data: session, status } = useSession();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add bills"];

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
    if (selectedClassId && selectedSemesterId) {
      fetchInvoiceData();
    }
  }, [selectedClassId, selectedSemesterId]);


  const fetchInvoiceData = async () => {
    setIsLoading(true);
    console.log(
      "selected class and semester",
      selectedClassId,
      selectedSemesterId
    );
    try {
      const data = await fetchData(
        `/api/finance/viewinvoice/${selectedClassId}/${selectedSemesterId}`, '', false
      );
      setInvoiceData(data);
      if(data){

        setInvoiceItems(data?.invoiceItems);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      toast.error(
        "Failed to fetch invoice data or there is no data for the class and semester selected"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setInvoiceItems([]);
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setSelectedSemesterId(semesterId);
    setInvoiceItems([]);
  };

  const handleInvoiceChange = (index, field, value) => {
    const newInvoiceItems = [...invoiceItems];
    newInvoiceItems[index][field] = value;
    setInvoiceItems(newInvoiceItems);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: "", amount: "" }]);
  };

  const removeInvoiceItem = (index) => {
    const newInvoiceItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newInvoiceItems);
  };

  const resetForm = () => {
    setInvoiceItems([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invoiceItems.length === 0) {
      setIsInfoModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setIsLoading(true)
    submitData({
      apiUrl: "/api/finance/addinvoice",
      data: {
        class_id: selectedClassId,
        semester_id: selectedSemesterId,
        invoices: invoiceItems,
      },
      successMessage: "Invoices added successfully",
      errorMessage: "Failed to add invoices",
      resetForm: () => {
        resetForm();
        setSelectedClassId("");
        setSelectedSemesterId("");
      },
      onSuccess: (result) => {
        // Any additional actions on success
      },
      onError: (error) => {
        // Any additional actions on error
      },
    });
    setIsLoading(false)
  };


  if (isLoading) {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add bills" to be on this page...!
      </div>
    );
  }


  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Add New Invoices?"
        message="Are you sure you want to add these new invoices?"
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="Please add at least one invoice item before submitting."
      />

      <Addeditinvoicepage
        classData={classData}
        semesterData={semesterData}
        selectedClassId={selectedClassId}
        selectedSemesterId={selectedSemesterId}
        handleClassChange={handleClassChange}
        handleSemesterChange={handleSemesterChange}
        invoiceItems={invoiceItems}
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

export default Addeditinvoice;
