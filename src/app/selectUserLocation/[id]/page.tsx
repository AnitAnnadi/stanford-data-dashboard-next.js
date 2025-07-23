import SelectUserLocationForm from "@/components/selectCreateLocation/SelectUserLocationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserFromLocation, stanfordAddUserLocation } from "@/utils/actions";
import { Roles } from "@prisma/client";
import React from "react";

const StanfordSelectUserLocationPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { id: locationId } = await params;
  const {
    user: { name, role },
  } = await getUserFromLocation(locationId);
  const selectedUserCanAccessNonUS =
    role === Roles.site || role === Roles.teacher;

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-medium">
            Select a Location
          </CardTitle>
          <CardDescription>
            Select a location for <span className="capitalize">{name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectUserLocationForm
            role={Roles.stanford}
            isTeacher={false}
            action={stanfordAddUserLocation}
            locationId={locationId}
            selectedUserCanAccessNonUS={selectedUserCanAccessNonUS}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StanfordSelectUserLocationPage;
