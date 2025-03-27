import React from "react";
import { TextAreaFieldProps } from "@/types";

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  placeholder,
  onChange,
  required = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
        className="text-sm text-gray-600 mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-green-500 focus:border-green-500"
        placeholder={placeholder}
      ></textarea>
    </div>
  );
};

export default TextAreaField;
