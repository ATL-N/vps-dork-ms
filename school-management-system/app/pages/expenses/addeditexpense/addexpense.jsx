"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import {
  FaMoneyBillWave,
  FaCalendar,
  FaFileInvoice,
  FaUserTie,
  FaBuilding,
} from "react-icons/fa";
import {
  InputField,
  SelectField,
} from "../../../components/inputFieldSelectField";
import ConfirmModal from "../../../components/modal/confirmModal";
import InfoModal from "../../../components/modal/infoModal";
import Loadingpage from "../../../components/Loadingpage";
import { getTodayString } from "../../../config/configFile";

const AddEditExpense = ({
  id,
  expenseData,
  onCancel,
  staffData,
  suppliersData,
}) => {
  const { data: session, status } = useSession();

  const initialState = {
    expense_category: "",
    recipient_name: "",
    description: "",
    amount: null,
    expense_date: getTodayString(),
    invoice_number: "",
    supplier_id: null,
    staff_id: null,
    user_id: session?.user?.id,
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["add expense"];

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
    if (id && expenseData) {
      setFormData({
        ...formData,
        expense_id: id,
        expense_category: expenseData.expense_category,
        description: expenseData.description,
        recipient_name: expenseData.recipient_name,
        amount: expenseData.amount,
        expense_date: expenseData.expense_date,
        invoice_number: expenseData.invoice_number,
        supplier_id: expenseData.supplier_id,
        staff_id: expenseData.staff_id,
      });
    }
  }, [id, expenseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      const newState = { ...prevState, [name]: value };

      if (name === "expense_category") {
        newState.staff_id = null;
        newState.supplier_id = null;
        newState.amount = null; // Reset amount when expense category changes
      }

      // If staff is selected for salary expense, update amount automatically
      if (name === "staff_id" && prevState.expense_category === "Salaries") {
        const selectedStaff = staffData.find(
          (staff) => staff.staff_id.toString() === value
        );
        if (selectedStaff) {
          newState.amount = selectedStaff.salary;
        }
      }

      return newState;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsModalOpen(false);

    const toastId = toast.loading(
      id ? "Updating expense..." : "Adding expense..."
    );

    try {
      const url = id
        ? `/api/finance/updateexpense/${id}`
        : "/api/finance/addexpenses";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process expense");
      }

      toast.update(toastId, {
        render:
          result.message || `Expense ${id ? "updated" : "added"} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (!id) setFormData(initialState);
    } catch (error) {
      console.error("Error processing expense:", error);
      toast.update(toastId, {
        render: error.message || `Error ${id ? "updating" : "adding"} expense`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const title = id
    ? `Edit Expense: ${formData.expense_category}`
    : "Add New Expense";

  if (isLoading) {
    return <Loadingpage />;
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised "add expense" to be on this page...!
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={id ? "Update expense" : "Add New expense"}
        message={
          id
            ? "Are you sure you want to update Expense?"
            : "Are you sure you want to add this new expense?"
        }
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="No changes detected. Please make changes before updating."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600"
      >
        <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
          {title}
        </h2>
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
              Expense Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Expense Category"
                name="expense_category"
                icon={<FaMoneyBillWave />}
                value={formData.expense_category}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select expense category" },
                  { value: "Salaries", label: "Salaries" },
                  { value: "Supplies", label: "Supplies" },
                  { value: "Utilities", label: "Utilities" },
                  { value: "Maintenance", label: "Maintenance" },
                  { value: "Other", label: "Other" },
                ]}
              />
              {formData.expense_category === "Salaries" && (
                <SelectField
                  label="Recipient Name"
                  name="staff_id"
                  icon={<FaUserTie />}
                  value={formData.staff_id}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select staff" },
                    ...staffData?.map((staff) => ({
                      value: staff.staff_id,
                      label: `${staff?.first_name} ${staff?.last_name} (GHC ${staff?.salary})`,
                    })),
                  ]}
                />
              )}

              {formData.expense_category === "Supplies" && (
                <SelectField
                  label="Recipient Name"
                  name="supplier_id"
                  icon={<FaMoneyBillWave />}
                  value={formData.supplier_id}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select supplier" },
                    ...suppliersData?.map((supplier) => ({
                      value: supplier.supplier_id,
                      label: supplier.supplier_name,
                    })),
                  ]}
                />
              )}

              {["Utilities", "Other", "Maintenance"].includes(
                formData.expense_category
              ) && (
                <InputField
                  label="Recipient name"
                  name="recipient_name"
                  icon={<FaBuilding />}
                  value={formData.recipient_name}
                  onChange={handleChange}
                  placeholder="Recipient name..."
                />
              )}

              <InputField
                type="number"
                label="Amount"
                name="amount"
                icon={<FaMoneyBillWave />}
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                isReadOnly={formData?.expense_category === "Salaries"}
                className={
                  formData.expense_category === "Salaries" ? "bg-gray-100" : ""
                }
              />
              <InputField
                type="date"
                label="Expense Date"
                name="expense_date"
                icon={<FaCalendar />}
                value={formData.expense_date}
                onChange={handleChange}
                max={getTodayString()}
                isReadOnly={true}
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
                placeholder="Enter expense description"
              ></textarea>
            </div>
          </section>
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : id
              ? "Update Expense"
              : "Add Expense"}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddEditExpense;
