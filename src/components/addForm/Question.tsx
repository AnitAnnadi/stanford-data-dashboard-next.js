"use client";
import FormInput from "@/components/form/FormInput";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoPlus } from "react-icons/go";
import { useState } from "react";
import Option from "./Option";
import { RadioGroup } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { CgTrash } from "react-icons/cg";

const Question = () => {
  const [numOptions, setNumOptions] = useState(2);

  return (
    <Card className="relative mt-4 focus-within:border-l-6 focus-within:border-l-primary transition-colors duration-200 ease-in-out">
      <CardContent className="space-y-4">
        <FormInput
          name="question"
          placeholder="Enter your question"
          type="text"
        />
        <div className="flex items-center gap-x-1">
          <h4 className="text-sm font-medium">Options</h4>
          <Button
            className="h-5 w-5"
            type="button"
            onClick={() => setNumOptions((prev) => (prev += 1))}
          >
            <GoPlus />
          </Button>
        </div>
        <RadioGroup disabled>
          {Array.from({ length: numOptions }, (_, index) => {
            return <Option key={index} index={index} />;
          })}
        </RadioGroup>
        <Separator />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="absolute bottom-0.5 right-3"
        >
          <CgTrash className="size-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default Question;
