import React from "react";
import { RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";

const Option = ({ index }: { index: number }) => {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem
        value={`option${index}`}
        className="h-5 w-5 border-2 border-gray-400"
      />
      <Input placeholder={`Option ${index + 1}`} />
      <Button type="button" size="icon" variant="ghost">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Option;
