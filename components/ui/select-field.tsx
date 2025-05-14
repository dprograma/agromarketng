import React from "react";
import { SelectFieldProps } from "@/types";

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="text-sm font-medium text-gray-800 mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
      >
        <option value="" className="font-medium text-gray-800">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option} className="font-medium text-gray-800">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
