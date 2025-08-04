"use client";

import TitleInput from "@/components/addForm/TitleInput";
import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { emailCertificate } from "@/utils/actions";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

const SubmissionSuccessPage = () => {
  useEffect(() => {
    localStorage.removeItem("studentLocation");
    localStorage.removeItem("studentDetails");
  }, []);

  const title = decodeURIComponent(usePathname().split("/")[3]);

  return (
    <div className="w-full mx-auto p-8 max-w-3xl">
      <TitleInput
        defaultValue={title}
        description="Your response has been recorded."
        disabled={true}
      />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Get your certificate</CardTitle>
          <CardDescription>
            Enter your name and email to recieve your certificate. Neither will
            be stored or linked to your form response.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormContainer action={emailCertificate}>
            <FormInput name="name" type="text" />
            <FormInput name="email" type="email" />
            <SubmitButton text="email certificate" className="w-full" />
          </FormContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionSuccessPage;
