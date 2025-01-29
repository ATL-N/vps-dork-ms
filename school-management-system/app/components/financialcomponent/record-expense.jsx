// pages/dashboard/financial-management/components/record-expense.js
import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaList,
  FaFileAlt,
  FaMoneyBillWave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { useSession } from "next-auth/react";


const RecordExpense = ({ onClose }) => {
    const { data: session, status } = useSession();

    const [isAuthorised, setIsAuthorised] = useState(true);
    const [activeSemester, setActiveSemester] = useState();


      useEffect(() => {
        const authorizedRoles = ["admin"];
        const authorizedPermissions = ["add expense", "update expense"];

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


  const [expenseData, setExpenseData] = useState({
    date: "",
    category: "",
    description: "",
    amount: "",
    items: [{ description: "", amount: "" }],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData({ ...expenseData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...expenseData.items];
    newItems[index][field] = value;
    setExpenseData({ ...expenseData, items: newItems });
  };

  const addItem = () => {
    setExpenseData({
      ...expenseData,
      items: [...expenseData.items, { description: "", amount: "" }],
    });
  };

  const removeItem = (index) => {
    const newItems = expenseData.items.filter((_, i) => i !== index);
    setExpenseData({ ...expenseData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to submit the expense data
    console.log("Expense data:", expenseData);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 text-cyan-800 h-[80vh] overflow-auto"
    >
      <h2 className="text-2xl font-bold text-cyan-700 mb-6">Record Expense</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="date"
          >
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              required
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              value={expenseData.date}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="category"
          >
            Category
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaList className="text-gray-400" />
            </div>
            <select
              name="category"
              id="category"
              required
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              value={expenseData.category}
              onChange={handleInputChange}
            >
              <option value="">Select category</option>
              <option value="supplies">Supplies</option>
              <option value="maintenance">Maintenance</option>
              <option value="utilities">Utilities</option>
              <option value="salaries">Salaries</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="description"
        >
          Description
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFileAlt className="text-gray-400" />
          </div>
          <input
            type="text"
            name="description"
            id="description"
            required
            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Expense description"
            value={expenseData.description}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="amount"
        >
          Total Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMoneyBillWave className="text-gray-400" />
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            required
            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="0.00"
            value={expenseData.amount}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expense Items
        </label>
        {expenseData.items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
              placeholder="Item description"
              className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
            <input
              type="number"
              value={item.amount}
              onChange={(e) =>
                handleItemChange(index, "amount", e.target.value)
              }
              placeholder="Amount"
              className="w-24 p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center text-cyan-600 hover:text-cyan-700"
        >
          <FaPlus className="mr-1" /> Add Item
        </button>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          Record Expense
        </button>
      </div>
    </form>
  );
};

export default RecordExpense;
