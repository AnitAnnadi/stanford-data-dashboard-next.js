import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserLocationCount, getUser } from "@/utils/actions";
import CreateLocationForm from "@/components/selectCreateLocation/CreateLocationForm";

const CreateLocationPage = async () => {
  const { numApprovedUserLocations } = await getUserLocationCount();
  const { role, isTeacher } = await getUser();

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-medium">
            Create A Location
          </CardTitle>
          <CardDescription>
            Fill out the form below to create a new location
          </CardDescription>
          {numApprovedUserLocations > 0 && (
            <CardAction>
              <Button variant="link" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <CreateLocationForm role={role} isTeacher={isTeacher} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLocationPage;
