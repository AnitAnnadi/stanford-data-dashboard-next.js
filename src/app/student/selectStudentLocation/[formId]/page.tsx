import SelectUserLocationForm from "@/components/selectCreateLocation/SelectUserLocationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Roles } from "@prisma/client";
import React from "react";
import Logo from "@/components/global/Logo";

const SelectStudentLocationPage = async ({ params }: any) => {
  const { formId } = await params;

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <Logo />
        <CardHeader>
          <CardTitle className="text-3xl font-medium">
            Select a Location
          </CardTitle>
          <CardDescription>Please select your school location.</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectUserLocationForm
            role={Roles.stanford}
            isTeacher={false}
            formId={formId}
            storeLocallyOnly={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectStudentLocationPage;
