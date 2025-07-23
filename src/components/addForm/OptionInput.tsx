import React from "react";
import { RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { questionOption } from "@/utils/types";
import { updateOptionFn, deleteOptionFn } from "@/utils/types";

const Option = ({
  optionNumber,
  option,
  questionId,
  updateOption,
  deleteOption,
}: {
  optionNumber: number;
  option: questionOption;
  questionId: string;
  updateOption: updateOptionFn;
  deleteOption: deleteOptionFn;
}) => {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem
        value={`option ${optionNumber}`}
        className="h-5 w-5 border-2 border-gray-400"
      />
      <div className="w-full grid grid-cols-[2fr_1fr] gap-x-2">
        <Input
          placeholder={`Option ${optionNumber}`}
          value={option.text}
          onChange={(e) =>
            updateOption(questionId, option.id, e.target.value, option.code)
          }
          required
        />
        <Input
          placeholder={`Code`}
          value={option.code || ""}
          onChange={(e) =>
            updateOption(
              questionId,
              option.id,
              option.text,
              Number(e.target.value)
            )
          }
          required
        />
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => deleteOption(questionId, option.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Option;
