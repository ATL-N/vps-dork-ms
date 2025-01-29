"use client";
import React, { useState, useEffect } from "react";
import Addeditfees from "../../../components/feescomponent/addeditfees";
import { toast } from "react-toastify";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../config/firebase";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";
import { useSession } from "next-auth/react";
import Loadingpage from "../../../components/Loadingpage";
import ReceiptGenerator from "../feereceipt/feereceipt";
import { getTodayString } from "../../../config/configFile";

const AddNewFee = ({ id, student_id, onCancel, studentsData, payment_id }) => {
  const { data: session, status } = useSession();

  const initialState = {
    photo: null,
    first_name: "",
    last_name: "",
    other_names: "",
    date_of_birth: "",
    payment_date: getTodayString(),
    amount_received: 0,
    old_balance: 0,
    new_balance: studentsData?.old_balance,
    cash_in_hand: 0,
    cash_balance: 0,
    payment_mode: "",
    comments: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [printDirect, setPrintDirect] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["take fees"];

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
    console.log("studentsData", studentsData, session.user.student_id);
    const fetchStaffData = async () => {
      if (student_id && studentsData) {
        console.log('studentsData', studentsData)
        const initialFormData = {
          ...studentsData,
          student_id: student_id,
          payment_date: formData.payment_date,
          new_balance: formData.new_balance,
          payment_date: formData.payment_date,
          old_balance: studentsData.old_balance,
          received_by: session.user?.id,
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);

        if (studentsData.photo) {
          try {
            const imageRef = ref(storage, studentsData.photo);
            const imageUrl = await getDownloadURL(imageRef);
            setImagePreview(imageUrl);
          } catch (error) {
            console.error("Error fetching image from Firebase:", error);
          }
        }
      }
    };
    fetchStaffData();
  }, [student_id, studentsData]);

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        setImageUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setFormData((prevState) => ({ ...prevState, photo: file }));
        };
        reader.readAsDataURL(file);
      }
    } else if (name === "amount_received") {
      const balance = parseFloat(formData.old_balance);
      const received = parseFloat(value); // Convert to a float to handle decimal values
      const calculatedBalance = balance - received;
      setFormData({
        ...formData,
        [name]: value,
        new_balance: calculatedBalance.toFixed(2), // Format as a decimal number with two decimal places
      });
    } else if (name === "cash_in_hand") {
      const balance = parseFloat(formData.amount_received);
      const received = parseFloat(value); // Convert to a float to handle decimal values
      const calculatedBalance = received - balance;
      setFormData({
        ...formData,
        [name]: value,
        cash_balance: calculatedBalance.toFixed(2), // Format as a decimal number with two decimal places
      });
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
    // console.log("formData", formData);
  };

  const hasChanges = () => {
    return (
      Object.keys(formData).some((key) => {
        if (key === "photo") return false;
        return formData[key] !== originalData[key];
      }) || imageUpload !== null
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("formData", formData);

    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsModalOpen(false);

    const toastId = toast.loading("Processing your request...");

    if (id && !hasChanges()) {
      toast.update(toastId, {
        render: "No changes detected. Please make changes before updating.",
        type: "info",
        isLoading: false,
        autoClose: 5000,
      });
      setIsInfoModalOpen(true);
      return;
    }

    const studentsData = {
      ...formData,
      new_balance: parseFloat(formData.new_balance),
      sendSMS: sendSMS,
      //  photo: photoURL,
    };

    try {
      const url = id ? `/api/fees/addfees` : "/api/fees/addfees";
      const method = id ? "PUT" : "POST";

      toast.update(toastId, {
        render: id ? "Updating Fees information..." : "Adding new Fees...",
        type: "info",
        isLoading: true,
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentsData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.update(toastId, {
          render: result.error || "An error occurred. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        // throw new Error(result.error || "Failed to process request");
        return;
      }

      toast.update(toastId, {
        render: result.message || "Operation completed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      if (!id) {
        setFormData(initialState);
        setImagePreview(null);
        setImageUpload(null);
      }
      // onCancel();
      setReceiptData(result.receipt_data);
      console.log("result.receipt_data", result.receipt_data);
      if (printReceipt) {
        setPrintDirect(true)
        setShowReceipt(true);
      }
      
    } catch (error) {
      console.error(id ? "Error updating Fees:" : "Error adding Fees:", error);
      toast.update(toastId, {
        render: error.message || "An error occurred. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "take fees" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update Fees " : "Add New Fees "}
        message={
          id
            ? `Are you sure you want to update ${formData.first_name}'s details?`
            : "Are you sure you want to add this new Fees? This transaction cannot be reversed"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="No changes detected. Please make changes before updating."
      />

      <Addeditfees
        formData={formData}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        imagePreview={imagePreview}
        onCancel={onCancel}
        id={id}
        studentData={studentsData}
        sendSMS={sendSMS}
        setSendSMS={setSendSMS}
        printReceipt={printReceipt}
        setPrintReceipt={setPrintReceipt}
      />

      {showReceipt && (
        <ReceiptGenerator
          receiptData={receiptData}
          onClose={() => {
            setShowReceipt(false);
            onCancel();
          }}
          printDirect={printDirect}
        />
      )}
    </>
  );
};

export default AddNewFee;
