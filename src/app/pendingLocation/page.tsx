import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserLocationCount, getUser } from "@/utils/actions";

const PendingLocationPage = async () => {
  const { role, isTeacher } = await getUser();
  const { numApprovedUserLocations } = await getUserLocationCount();

  const requiresUserLocationSelection =
    role !== "site" && numApprovedUserLocations === 0;

  let displayRole = role;
  if (!isTeacher) {
    displayRole += " admin";
  }

  return (
    <div className="grid h-lvh place-items-center">
      <Alert className="max-w-lg">
        <CheckCircle2Icon />
        <AlertTitle>
          Success! We are reviewing your custom location request.
        </AlertTitle>
        <AlertDescription>
          <ul className="list-inside list-disc text-sm">
            <li>Processing may take up to 24 hours.</li>
            <li>
              If approved, the location will automatically be added to your
              account.
            </li>
            {role === "site" && (
              <li>
                As a site admin, you will not be able to access the dashboard
                until a decision is made on your location request
              </li>
            )}
            {requiresUserLocationSelection && (
              <li>
                As a {displayRole}, you must either select an existing valid
                location or wait for your custom location to be approved to
                access your dashboard.
              </li>
            )}
          </ul>
          {requiresUserLocationSelection && (
            <Button variant="link" className="p-0" asChild>
              <Link href={"/selectUserLocation"}>Select a Location</Link>
            </Button>
          )}
          {numApprovedUserLocations > 0 && (
            <Button variant="link" className="p-0" asChild>
              <Link href={"/dashboard"}>Go to Dashboard</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PendingLocationPage;
