import React, { useState, useRef, useEffect } from "react";
import { FaCaretDown, FaCheck } from "react-icons/fa";

export const InputField = ({
  label,
  name,
  type = "text",
  icon,
  value,
  onChange,
  placeholder,
  title = " ",
  isRequired = true,
  isReadOnly = false,
  min,
  max,
}) => (
  <div className="text-cyan-600">
    <label
      className="block text-sm font-medium text-gray-700 mb-2"
      htmlFor={name}
    >
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        id={name}
        required={isRequired}
        readOnly={isReadOnly}
        className={`pl-10 w-full p-2 border rounded-md focus:outline-none ${
          isReadOnly
            ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
            : "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
        }`}
        placeholder={placeholder}
        value={value}
        title={title}
        onChange={onChange}
        min={min}
        max={max}
      />
    </div>
  </div>
);
export const SelectField = ({
  label,
  name,
  icon,
  value,
  onChange,
  options,
  title = " ",
  isRequired = true,
  isReadOnly = false,
  isDisAbled = false,
}) => (
  <div>
    <label
      className="block text-sm font-medium text-gray-700 mb-2"
      htmlFor={name}
    >
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 text-cyan-600 flex items-center pointer-events-none">
        {icon}
      </div>
      <select
        name={name}
        id={name}
        required={isRequired}
        readOnly={isReadOnly}
        disabled={isDisAbled}
        className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
        value={value}
        onChange={onChange}
        title={title}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export const TextAreaField = ({
  label,
  name,
  icon,
  value,
  onChange,
  placeholder,
  isRequired = true,
  isReadOnly = false,
  displayCount = false,
  maxLength = 160, // Add maxLength prop with default value
  charsPerPage = 1600, // Add charsPerPage prop with a default
}) => {
  // Handle change with character limit
  const handleChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxLength || text.length >= maxLength) {
      onChange(e);
    }
  };

  const calculatePages = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / maxLength);
  };

  const pageCount = calculatePages(value);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <textarea
          name={name}
          rows="3"
          className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={isRequired}
          readOnly={isReadOnly}
          // maxLength={maxLength}
        ></textarea>
        {displayCount && (
          <div className="absolute bottom-2 right-2 text-sm text-gray-500">
            {value?.length || 0}/{maxLength} ({pageCount}{" "}
            {pageCount === 1 ? "page" : "pages"})
          </div>
        )}
      </div>
    </div>
  );
};

export const MultiSelectDropdown = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  label,
  isRequired = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check if all options are selected
  const isAllSelected =
    options.length > 0 && selectedValues.length === options.length;

  // Check if some options are selected
  const isSomeSelected =
    selectedValues.length > 0 && selectedValues.length < options.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      // If all are selected, deselect all
      onChange([]);
    } else {
      // If not all are selected, select all
      const allValues = options.map((option) => option.value);
      onChange(allValues);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === options.length) return "All selected";
    if (selectedValues.length === 1) {
      return options.find((opt) => opt.value === selectedValues[0])?.label;
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div
          className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-700">{getDisplayText()}</span>
          <FaCaretDown
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Select All Option */}
            <div
              className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50 sticky top-0"
              onClick={handleSelectAll}
            >
              <div className="w-4 h-4 border border-gray-300 rounded mr-3 flex items-center justify-center">
                {isAllSelected && <FaCheck className="text-cyan-600 text-xs" />}
                {isSomeSelected && (
                  <div className="w-2 h-2 bg-cyan-600 rounded-sm"></div>
                )}
              </div>
              <span className="font-medium">Select All</span>
            </div>

            {/* Individual Options */}
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleToggleOption(option.value)}
              >
                <div className="w-4 h-4 border border-gray-300 rounded mr-3 flex items-center justify-center">
                  {selectedValues.includes(option.value) && (
                    <FaCheck className="text-cyan-600 text-xs" />
                  )}
                </div>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          {selectedValues.length} item{selectedValues.length !== 1 ? "s" : ""}{" "}
          selected
        </div>
      )}
    </div>
  );
};

// export const MultiSelectDropdown = ({
//   options,
//   selectedValues,
//   onChange,
//   placeholder = "Select options",
//   label,
//   isRequired = false,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleToggleOption = (value) => {
//     const newSelectedValues = selectedValues.includes(value)
//       ? selectedValues.filter((item) => item !== value)
//       : [...selectedValues, value];
//     onChange(newSelectedValues);
//   };

//   const getDisplayText = () => {
//     if (selectedValues.length === 0) return placeholder;
//     if (selectedValues.length === 1) {
//       return options.find((opt) => opt.value === selectedValues[0])?.label;
//     }
//     return `${selectedValues.length} selected`;
//   };

//   return (
//     <div className="mb-4" ref={dropdownRef}>
//       <label className="block text-sm font-medium text-gray-700 mb-2">
//         {label} {isRequired && <span className="text-red-500">*</span>}
//       </label>
//       <div className="relative">
//         <div
//           className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer bg-white"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           <span className="text-gray-700">{getDisplayText()}</span>
//           <FaCaretDown
//             className={`transition-transform duration-200 ${
//               isOpen ? "rotate-180" : ""
//             }`}
//           />
//         </div>

//         {isOpen && (
//           <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
//             {options.map((option) => (
//               <div
//                 key={option.value}
//                 className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 onClick={() => handleToggleOption(option.value)}
//               >
//                 <div className="w-4 h-4 border border-gray-300 rounded mr-3 flex items-center justify-center">
//                   {selectedValues.includes(option.value) && (
//                     <FaCheck className="text-cyan-600 text-xs" />
//                   )}
//                 </div>
//                 <span>{option.label}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
