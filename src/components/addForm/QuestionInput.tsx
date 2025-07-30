"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoPlus } from "react-icons/go";
import OptionInput from "./OptionInput";
import { RadioGroup } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { CgTrash } from "react-icons/cg";
import { question } from "@/utils/types";
import { Input } from "../ui/input";
import {
  updateQuestionFn,
  handleQuestionByIdFn,
  updateOptionFn,
  deleteOptionFn,
} from "@/utils/types";

const QuestionInput = ({
  question,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
}: {
  question: question;
  updateQuestion: updateQuestionFn;
  deleteQuestion: handleQuestionByIdFn;
  addOption: handleQuestionByIdFn;
  updateOption: updateOptionFn;
  deleteOption: deleteOptionFn;
}) => {
  return (
    <Card className="relative mt-4 focus-within:border-l-6 focus-within:border-l-primary transition-colors duration-200 ease-in-out">
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter your question"
          type="text"
          value={question.question}
          onChange={(e) => updateQuestion(question.id, e.target.value)}
          required
        />
        <div className="flex items-center gap-x-1">
          <h4 className="text-sm font-medium">Options</h4>
          <Button
            className="h-5 w-5"
            type="button"
            onClick={() => addOption(question.id)}
          >
            <GoPlus />
          </Button>
        </div>
        <RadioGroup disabled>
          {question.options.map((option, index) => {
            return (
              <OptionInput
                key={option.id}
                optionNumber={index + 1}
                option={option}
                questionId={question.id}
                updateOption={updateOption}
                deleteOption={deleteOption}
              />
            );
          })}
        </RadioGroup>
        <Separator />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="absolute bottom-0.5 right-3"
          onClick={() => deleteQuestion(question.id)}
        >
          <CgTrash className="size-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuestionInput;
