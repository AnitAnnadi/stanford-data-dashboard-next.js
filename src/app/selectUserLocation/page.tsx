import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SelectUserLocationForm from "@/components/selectCreateLocation/SelectUserLocationForm";
import {
  getUserLocationCount,
  getUser,
  addUserLocation,
} from "@/utils/actions";
import { Roles } from "@prisma/client";
import Image from "next/image";

const SelectUserLocationPage = async () => {
  const { numApprovedUserLocations } = await getUserLocationCount();
  const { role, isTeacher } = await getUser();

  const title =
    numApprovedUserLocations === 0
      ? "Select a Location"
      : `Select Location ${numApprovedUserLocations + 1}`;
  const link = isTeacher ? "/dashboard" : "/dashboard/metrics";
  const isCustomLocationAllowed = isTeacher || role === Roles.site;

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <Image
          src="/image001.png"
          alt="logo"
          width={250}
          height={125}
          className="mx-auto"
        />
        <CardHeader>
          <CardTitle className="text-3xl font-medium">{title}</CardTitle>
          <CardDescription>
            Please choose your workplace location from the options provided
            below
          </CardDescription>
          {numApprovedUserLocations > 0 && (
            <CardAction>
              <Button variant="link" asChild>
                <Link href={link}>Go to Dashboard</Link>
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <SelectUserLocationForm
            role={role}
            isTeacher={isTeacher}
            action={addUserLocation}
          />
        </CardContent>
        {isCustomLocationAllowed && (
          <CardFooter>
            <p className="mr-1">Don&apos;t see your school?</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/createLocation">Create A Location</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SelectUserLocationPage;
