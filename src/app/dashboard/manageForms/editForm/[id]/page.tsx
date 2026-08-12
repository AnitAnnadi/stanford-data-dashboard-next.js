import FormDetailsInput from "@/components/addForm/FormDetailsInput";
import EditQuestionsPanel from "@/components/editForm/EditQuestionsPanel";
import TitleInput from "@/components/addForm/TitleInput";
import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import { Input } from "@/components/ui/input";
import {
  updateForm,
  getSingleForm,
  getCounterpartType,
  getAnsweredQuestionIds,
} from "@/utils/actions";
import React from "react";

const EditFormPage = async ({ params }: any) => {
  const { id: formId } = params;
  const { title, type, active, provideCertificate, questions } =
    await getSingleForm(formId);
  const [counterpartType, answeredQuestionIds] = await Promise.all([
    getCounterpartType(formId),
    getAnsweredQuestionIds(formId),
  ]);

  return (
    <FormContainer action={updateForm}>
      <Input name="formId" type="hidden" value={formId} />
      <TitleInput
        defaultValue={title}
        note="Renaming also renames the matching pre/post survey. Existing responses stay attached, but printed or QR-code links that use the old name will stop working."
      />
      <FormDetailsInput
        defaultValues={{
          type,
          active: active ? "true" : "false",
          provideCertificate: provideCertificate ? "true" : "false",
        }}
        disableType={true}
      />
      <EditQuestionsPanel
        initialQuestions={questions}
        counterpartType={counterpartType}
        answeredQuestionIds={answeredQuestionIds}
      />
      <SubmitButton text="save changes" className="mt-4 w-full" />
    </FormContainer>
  );
};

export default EditFormPage;
