import React, { useMemo } from "react";
import {
  FaBook,
  FaMoneyBill,
  FaPlusCircle,
  FaMinusCircle,
  FaSave,
  FaUndo,
  FaCalendarPlus,
  FaFileAlt,
} from "react-icons/fa";
import { FaBuildingFlag } from "react-icons/fa6";
import {
  InputField,
  SelectField,
  TextAreaField,
} from "../inputFieldSelectField";

const ItemMovementPage = ({
  formData,
  handleChange,
  staffData,
  itemsData,
  inventoryItems,
  selectedItemIds,
  handleSubmit,
  handleInvoiceChange,
  addInvoiceItem,
  removeInvoiceItem,
  resetForm,
  onCancel,
}) => {
  // Calculate total amount
  const totalAmount = useMemo(() => {
    return inventoryItems.reduce(
      (sum, item) =>
        sum + (parseFloat(item.quantity_per_student * item.unit_price) || 0),
      0
    );
  }, [inventoryItems]);

  // console.log("selectedItemIds", selectedItemIds);

  return (
    <div className="space-y-4 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">Move Item</h2>

      <div className="space-x-1 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <div className="flex-1">
          <label
            htmlFor="supplyType-select"
            className="block text-sm font-medium text-cyan-700"
          >
            Supply Type
          </label>
          <select
            id="supplyType-select"
            name="movement_type"
            className="mt-2  block w-full pl-3 pr-10 p-3 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={formData?.movement_type}
            onChange={handleChange}
          >
            <option value="">Select type of supply</option>
            <option value="Internal">Internal Supply</option>
            <option value="External">External Supply</option>
          </select>
        </div> */}

        <SelectField
          label="Supply Type"
          name="movement_type"
          icon={<FaFileAlt />}
          value={formData.movement_type}
          onChange={handleChange}
          options={[
            { value: "", label: "Select type of supply" },
            { value: "Internal", label: "Internal Supply" },
            { value: "External", label: "External Supply" },
          ]}
        />

        {formData?.movement_type === "Internal" && (
          <div className="flex-1">
            <label
              htmlFor="staff-select"
              name="staff_id"
              className="block text-sm font-medium text-cyan-700"
            >
              Select staff
            </label>
            <select
              id="staff-select"
              name="staff_id"
              required
              className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
              value={formData?.staff_id}
              onChange={handleChange}
            >
              <option value="">Select a staff</option>
              {staffData?.map((staff) => (
                <option key={staff.staff_id} value={staff.staff_id}>
                  {staff.first_name} {staff.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData?.movement_type === "External" && (
          <InputField
            type="text"
            label="Recipient Name"
            name="recipient_name"
            isRequired={true}
            icon={<FaCalendarPlus />}
            value={formData?.recipient_name}
            onChange={handleChange}
          />
        )}
        {formData?.movement_type === "External" && (
          <InputField
            type="number"
            label="Recipient Phone"
            name="recipient_phone"
            isRequired={true}
            icon={<FaCalendarPlus />}
            value={formData?.recipient_phone}
            onChange={handleChange}
          />
        )}

        {formData?.movement_type === "External" && (
          <TextAreaField
            type="phone"
            label="Details"
            name="comments"
            isRequired={true}
            icon={<FaCalendarPlus />}
            value={formData?.comments}
            onChange={handleChange}
          />
        )}
      </div>

      {/* {supplyType && selectedstaffId && ( */}
      <div className="bg-white pt-0 p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="overflow-x-auto ">
            <table className="w-full overflow-scroll">
              <thead>
                <tr className="bg-cyan-700 text-white">
                  <th className="p-2">Item Name/Description</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody className="overflow-scroll">
                {inventoryItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 ">
                      <select
                        id={`item_id-select-${index}`}
                        className="w-full border-2 border-cyan-300 rounded-md p-1"
                        value={item.item_id}
                        onChange={(e) =>
                          handleInvoiceChange(index, "item_id", e.target.value)
                        }
                        required
                      >
                        <option value="">Select a item name</option>
                        {itemsData?.map((dataItem) => (
                          <option
                            key={dataItem.item_id}
                            value={dataItem.item_id}
                            // disabled={true}
                            disabled={
                              selectedItemIds.has(dataItem.item_id)
                              // dataItem.item_id !== item.item_id
                            }
                          >
                            {dataItem.item_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleInvoiceChange(index, "quantity", e.target.value)
                        }
                        className="w-full border-2 border-cyan-300 rounded-md p-1"
                      />
                    </td>

                    <td className="p-2 ">
                      <select
                        id={`item_status-select-${index}`}
                        className="w-full border-2 border-cyan-300 rounded-md p-1"
                        value={item.item_status}
                        required
                        onChange={(e) =>
                          handleInvoiceChange(
                            index,
                            "item_status",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select status</option>
                        <option value="out">Out Going</option>
                        <option value="in">In Coming</option>
                      </select>
                    </td>

                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => removeInvoiceItem(index)}
                        className="text-red-500"
                      >
                        <FaMinusCircle size={"1.3rem"} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Amount Display */}
          {/* <div className="mt-4 text-right">
            <span className="font-bold text-lg">Total Amount: </span>
            <span className="text-xl text-cyan-600">
              GHC {totalAmount.toFixed(2)}
            </span>
          </div> */}

          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={addInvoiceItem}
              className="text-cyan-600 flex items-center"
            >
              <FaPlusCircle size={"1.3rem"} className="mr-2" /> Add New Item
            </button>
            <div className="space-x-4 flex justify-around">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                onClick={resetForm}
              >
                <FaUndo className="mr-2" />
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
              >
                <FaSave className="mr-2" />
                Move Item
              </button>
            </div>
          </div>
        </form>
      </div>
      {/* // )} */}
    </div>
  );
};

export default ItemMovementPage;
