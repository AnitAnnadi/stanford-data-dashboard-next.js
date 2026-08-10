"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { useState } from "react";

const SelectInput = ({
  name,
  placeholder,
  options,
  label,
  defaultValue,
  disabled = false,
  withMargin = true,
  onValueChange,
  capitalizeItems = true,
}: {
  name: string;
  placeholder: string;
  options: { text: string; value: string }[];
  label?: string;
  defaultValue?: string;
  disabled?: boolean;
  withMargin?: boolean;
  onValueChange?: (value: string) => void;
  capitalizeItems?: boolean;
}) => {
  const [value, setValue] = useState(defaultValue || undefined);

  return (
    <>
      <Input name={name} type="hidden" value={value} disabled={disabled} />
      <Select
        value={value}
        onValueChange={(value) => {
          setValue(value);
          onValueChange?.(value);
        }}
        disabled={disabled}
        required
      >
        <SelectTrigger
          className={`w-full ${capitalizeItems ? "capitalize" : ""} ${withMargin ? "mt-3" : ""}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="capitalize">{label || name}</SelectLabel>
            {options.map((option) => {
              const { text, value } = option;
              return (
                <SelectItem
                  key={value}
                  value={value}
                  className={capitalizeItems ? "capitalize" : ""}
                >
                  {text}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectInput;
