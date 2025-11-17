import SelectUserLocationForm from "@/components/selectCreateLocation/SelectUserLocationForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserFromLocation, stanfordAddUserLocation } from "@/utils/actions";
import { Roles } from "@prisma/client";
import Link from "next/link";
import React from "react";
import Logo from "../../../components/global/Logo";

const StanfordSelectUserLocationPage = async ({ params }: any) => {
  const { id: locationId } = await params;
  const {
    user: { name, role },
  } = await getUserFromLocation(locationId);
  const selectedUserCanAccessNonUS =
    role === Roles.site || role === Roles.teacher;

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <Logo />
        <CardHeader>
          <CardTitle className="text-3xl font-medium">
            Select a Location
          </CardTitle>
          <CardDescription>
            Select a location for <span className="capitalize">{name}</span>.
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href={"/dashboard/manageLocations"}>
                Go to Manage Locations
              </Link>
            </Button>
          </CardAction>
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
