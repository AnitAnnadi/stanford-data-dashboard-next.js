import FormDetailsInput from "@/components/addForm/FormDetailsInput";
import Question from "@/components/studentForm/Question";
import TitleInput from "@/components/addForm/TitleInput";
import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import { Input } from "@/components/ui/input";
import { updateForm, getSingleForm } from "@/utils/actions";
import React from "react";

const EditFormPage = async ({ params }: any) => {
  const { id: formId } = params;
  const { title, type, active, provideCertificate, questions } =
    await getSingleForm(formId);

  return (
    <FormContainer action={updateForm}>
      <Input name="formId" type="hidden" value={formId} />
      <TitleInput defaultValue={title} disabled={true} />
      <FormDetailsInput
        defaultValues={{
          type,
          active: active ? "true" : "false",
          provideCertificate: provideCertificate ? "true" : "false",
        }}
        disableType={true}
      />
      {questions.map((question, i) => {
        return <Question key={i} question={question} disabled={true} />;
      })}
      <SubmitButton text="save changes" className="mt-4 w-full" />
    </FormContainer>
  );
};

export default EditFormPage;
