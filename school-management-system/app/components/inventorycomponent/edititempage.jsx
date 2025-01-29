// components/items/addnewitem.js
import React, { useState } from "react";
import {
  FaCalendarPlus,
  FaCalendar,
  FaVenusMars,
  FaUser,
} from "react-icons/fa";
import { InputField, SelectField } from "../inputFieldSelectField";

const EditItemPage = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
}) => {
  // console.log('formData', formData)

  const title = id ? `Edit ${formData?.item_name} Details` : "Add New item";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600"
    >
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
        {title}
      </h2>

      <div className="space-y-8">
        <section className="text-cyan-600">
          <h3 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
            item Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              type="text"
              label="Item Name"
              name="item_name"
              icon={<FaUser />}
              value={formData?.item_name}
              onChange={handleChange}
              // placeholder="e.g. First item, First term etc"
            />

            <SelectField
              label="category"
              name="category"
              icon={<FaVenusMars />}
              value={formData.category}
              onChange={handleChange}
              options={[
                { value: "", label: "Select category" },
                { value: "supply", label: "Supply" },
                { value: "movement", label: "Movement" },
              ]}
            />

            <InputField
              type="text"
              label="Unit Price"
              name="unit_price"
              icon={<FaCalendarPlus />}
              value={formData?.unit_price}
              onChange={handleChange}
              // title="date the item starts"
            />

            <InputField
              type="text"
              label="Quantity Desired"
              name="quantity_desired"
              icon={<FaCalendarPlus />}
              value={formData?.quantity_desired}
              onChange={handleChange}
              // title="date the item ends"
            />

            <InputField
              type="text"
              label="Quantity Available"
              name="quantity_available"
              icon={<FaCalendarPlus />}
              value={formData?.quantity_available}
              onChange={handleChange}
              // title="date the item ends"
            />

            <InputField
              type="text"
              label="Restock Level"
              name="restock_level"
              icon={<FaCalendarPlus />}
              value={formData?.restock_level}
              onChange={handleChange}
              // title="date the item ends"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <SelectField
              label="Status"
              name="status"
              icon={<FaVenusMars />}
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "", label: "Select item Status" },
                { value: "active", label: "active" },
                { value: "damaged", label: "damaged" },
                // { value: "upcoming", label: "upcoming" },
              ]}
            />
          </div>
        </section>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          Close
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          {id ? "Update item" : "Add item"}
        </button>
      </div>
    </form>
  );
};

export default EditItemPage;
