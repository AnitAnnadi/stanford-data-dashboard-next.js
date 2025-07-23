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
}: {
  name: string;
  placeholder: string;
  options: { text: string; value: string }[];
  label?: string;
  defaultValue?: string;
  disabled?: boolean;
  withMargin?: boolean;
}) => {
  const [value, setValue] = useState(defaultValue || "");

  console.log(value);

  return (
    <>
      <Input name={name} type="hidden" value={value} disabled={disabled} />
      <Select
        value={value}
        onValueChange={(value) => setValue(value)}
        disabled={disabled}
        required
      >
        <SelectTrigger
          className={`w-full capitalize ${withMargin ? "mt-3" : ""}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="capitalize">{label || name}</SelectLabel>
            {options.map((option) => {
              const { text, value } = option;
              return (
                <SelectItem key={value} value={value} className="capitalize">
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
