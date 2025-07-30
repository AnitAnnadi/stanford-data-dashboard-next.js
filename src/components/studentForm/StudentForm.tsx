"use client";

import React from "react";
import FormContainer from "../form/FormContainer";
import { SubmitButton } from "../form/Buttons";
import { Form } from "@prisma/client";
import Question from "./Question";
import { submitForm } from "@/utils/actions";
import { Input } from "../ui/input";

const StudentForm = ({ questions }: { questions: Form["questions"] }) => {
  const studentLocation = localStorage.getItem("studentLocation") ?? "";
  const studentDetails = localStorage.getItem("studentDetails") as string;

  return (
    <FormContainer action={submitForm}>
      <Input name="location" type="hidden" value={studentLocation} />
      <Input name="details" type="hidden" value={studentDetails} />
      {questions.map((question, i) => {
        return <Question key={i} question={question} />;
      })}
      <SubmitButton text="submit" className="w-full mt-3" />
    </FormContainer>
  );
};

export default StudentForm;
