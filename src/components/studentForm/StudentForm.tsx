"use client";

import React, { useEffect, useState } from "react";
import FormContainer from "../form/FormContainer";
import { SubmitButton } from "../form/Buttons";
import { Form } from "@prisma/client";
import Question from "./Question";
import { Input } from "../ui/input";
import {
  createResponseWithoutTeacher,
  createResponseWithTeacher,
} from "@/utils/actions";

const StudentForm = ({
  questions,
  formId,
  teacherId,
}: {
  questions: Form["questions"];
  formId: string;
  teacherId: string;
}) => {
  const joinedWithTeacherCode = teacherId !== "0";
  const [studentLocation, setStudentLocation] = useState("");
  const [studentDetails, setStudentDetails] = useState("");

  useEffect(() => {
    setStudentLocation(localStorage.getItem("studentLocation") ?? "");
    setStudentDetails(localStorage.getItem("studentDetails") ?? "");
  }, []);

  if (!studentDetails) return;

  return (
    <FormContainer
      action={
        joinedWithTeacherCode
          ? createResponseWithTeacher
          : createResponseWithoutTeacher
      }
    >
      <Input name="formId" type="hidden" value={formId} />
      <Input name="teacherId" type="hidden" value={teacherId} />
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
