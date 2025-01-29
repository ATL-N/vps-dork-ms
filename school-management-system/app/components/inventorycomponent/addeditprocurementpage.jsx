import React, { useMemo } from "react";
import {
  FaBook,
  FaMoneyBill,
  FaPlusCircle,
  FaMinusCircle,
  FaSave,
  FaUndo,
  FaCalendar,
} from "react-icons/fa";
import { FaBuildingFlag } from "react-icons/fa6";

const Addeditprocurementpage = ({
  selectedSupplierId,
  selectedDate,
  handleSupplierChange,
  handleDateChange,
  procuredItems,
  handleSubmit,
  handleInvoiceChange,
  addInvoiceItem,
  removeInvoiceItem,
  resetForm,
  itemsData,
  suppliersData,
  isEditing,
  readonly,
}) => {

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const get20YearsAgoString = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    return date.toISOString().split("T")[0];
  };
  const totalAmount = useMemo(() => {
    return procuredItems.reduce(
      (sum, item) => sum + (parseFloat(item.quantity * item.unit_cost) || 0),
      0
    );
  }, [procuredItems]);

  return (
    <div className="space-y-3 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">
        {isEditing ? "Procured Items" : "Procured Items"}
      </h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1 text-cyan-600">
          <label className="block text-sm font-medium text-cyan-700">
            Select supplier
          </label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={selectedSupplierId}
            onChange={handleSupplierChange}
            disabled={isEditing || readonly}
          >
            <option value="">Select supplier</option>
            {suppliersData?.map((supplier) => (
              <option key={supplier.supplier_id} value={supplier.supplier_id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 text-cyan-600">
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="date"
          >
            Select Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendar />
            </div>
            <input
              type="date"
              name="date"
              className="pl-10 w-full p-1 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              value={selectedDate}
              onChange={handleDateChange}
              disabled={isEditing || readonly}
              max={getTodayString()}
            />
          </div>
        </div>
      </div>

      {(selectedSupplierId && selectedDate) || isEditing ? (
        <div className="bg-white p-6 pt-0 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="overflow-x-auto max-h-[35vh]">
              <table className="w-full overflow-scroll">
                <thead>
                  <tr className="bg-cyan-700 text-white">
                    <th className="p-2">Item</th>
                    <th className="p-2">Selling Price</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Unit Cost(GHC)</th>
                    <th className="p-2">Total Cost(GHC)</th>
                    {!readonly && <th className="p-2">Actions</th>}
                  </tr>
                </thead>
                <tbody className="overflow-scroll">
                  {procuredItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <select
                          className="w-full border-2 border-cyan-300 rounded-md p-1 focus:ring-cyan-500 focus:border-cyan-500"
                          value={item.item_id}
                          required
                          disabled={readonly}
                          onChange={(e) =>
                            handleInvoiceChange(
                              index,
                              "item_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select an item</option>
                          {itemsData?.map((inItem) => (
                            <option key={inItem.item_id} value={inItem.item_id}>
                              {inItem.item_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          disabled={readonly}
                          value={item.unit_price}
                          onChange={(e) =>
                            handleInvoiceChange(
                              index,
                              "unit_price",
                              e.target.value
                            )
                          }
                          className="w-full border-2 border-cyan-300 rounded-md p-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          disabled={readonly}
                          value={item.quantity}
                          onChange={(e) =>
                            handleInvoiceChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full border-2 border-cyan-300 rounded-md p-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          disabled={readonly}
                          value={item.unit_cost}
                          onChange={(e) =>
                            handleInvoiceChange(
                              index,
                              "unit_cost",
                              e.target.value
                            )
                          }
                          className="w-full border-2 border-cyan-300 rounded-md p-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          readOnly
                          value={item.total_cost}
                          className="w-full border-2 border-cyan-300 rounded-md p-1"
                        />
                      </td>
                      {!readonly && (
                        <td className="p-2 self-center place-items-center">
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(index)}
                            className="text-red-500 flex self-center"
                          >
                            <FaMinusCircle size={"1.3rem"} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <span className="font-bold text-lg">Total Amount: </span>
              <span className="text-xl text-cyan-600">
                GHC {totalAmount.toFixed(2)}
              </span>
            </div>
            {!readonly && (
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={addInvoiceItem}
                  className="text-cyan-600 flex items-center"
                >
                  <FaPlusCircle size={"1.3rem"} className="mr-2" /> Add Procured
                  Item
                </button>
                <div className="space-x-4 flex justify-around">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                    onClick={resetForm}
                  >
                    <FaUndo className="mr-2" />
                    {isEditing ? "Undo Changes" : "Reset Form"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
                  >
                    <FaSave className="mr-2" />
                    {isEditing ? "Update Procurement" : "Save Procured Item(s)"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-4">
          Please select a supplier and date to add or edit procured items.
        </div>
      )}
    </div>
  );
};

export default Addeditprocurementpage;
