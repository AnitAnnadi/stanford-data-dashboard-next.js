"use client";
import FormContainer from "@/components/form/FormContainer";
import { addForm } from "@/utils/actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Question from "@/components/addForm/Question";
import { SubmitButton } from "@/components/form/Buttons";
import { IoIosAddCircleOutline } from "react-icons/io";
import TitleInput from "@/components/addForm/TitleInput";

const AddFormPage = () => {
  const [numQuestions, setNumQuestions] = useState(1);

  return (
    <FormContainer action={addForm}>
      <TitleInput />
      {Array.from({ length: numQuestions }, (_, index) => {
        return <Question key={index} />;
      })}
      <div className="mt-4 space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full flex gap-x-0.5"
          onClick={() => setNumQuestions((prev) => (prev += 1))}
        >
          <IoIosAddCircleOutline />
          Add Question
        </Button>
        <SubmitButton text="add form" className="w-full" />
      </div>
    </FormContainer>
  );
};

export default AddFormPage;
