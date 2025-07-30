import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FormInput from "@/components/form/FormInput";
import React from "react";
import { SubmitButton } from "@/components/form/Buttons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FormContainer from "@/components/form/FormContainer";
import { findUserByCode } from "@/utils/actions";
import { Input } from "@/components/ui/input";

const EnterCodePage = async ({ params }: { params: { formId: string } }) => {
  const { formId } = await params;

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Enter Code</CardTitle>
        </CardHeader>
        <CardContent>
          <FormContainer action={findUserByCode}>
            <Input name="formId" type="hidden" value={formId} />
            <FormInput name="code" type="text" label="teacher code" />
            <SubmitButton text="next" className="w-full" />
          </FormContainer>
        </CardContent>
        <CardFooter>
          Don&apos;t have a teacher code?
          <Button variant="link" className="pl-1" asChild>
            <Link href={`/student/selectStudentLocation/${formId}`}>
              Click here
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EnterCodePage;
