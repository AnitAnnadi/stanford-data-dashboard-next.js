import StudentDetailsForm from "@/components/studentDetails/StudentDetailsForm";
import { Card, CardContent } from "@/components/ui/card";
import { getUserLocations } from "@/utils/actions";

const DetailsPage = async ({
  params,
}: {
  params: { id: string; name: string };
}) => {
  const { id: teacherId, name } = await params;
  const decodedName = decodeURIComponent(name);

  const teacherLocations = await getUserLocations(teacherId);
  console.log(teacherLocations);

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <CardContent>
          <h3 className="font-semibold mb-6">
            You have joined {decodedName}&apos;s class
          </h3>
          <StudentDetailsForm teacherLocations={teacherLocations} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailsPage;
