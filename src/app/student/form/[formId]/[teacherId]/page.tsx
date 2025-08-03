import TitleInput from "@/components/addForm/TitleInput";
import StudentForm from "@/components/studentForm/StudentForm";
import { getSingleActiveForm } from "@/utils/actions";
import React from "react";

const FormPage = async ({
  params,
}: {
  params: { formId: string; teacherId: string };
}) => {
  const { formId, teacherId } = await params;
  const { title, questions } = await getSingleActiveForm(formId);

  return (
    <div className="w-full mx-auto p-8 max-w-3xl">
      <TitleInput defaultValue={title} disabled={true} />
      <StudentForm
        questions={questions}
        formId={formId}
        teacherId={teacherId}
      />
    </div>
  );
};

export default FormPage;
