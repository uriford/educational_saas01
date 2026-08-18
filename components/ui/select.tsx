"use client";

import * as React from "react";


const Select = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
};

const SelectItem = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => (
  <option value={value}>
    {children}
  </option>
);

export { Select, SelectItem };
