import StudentDetailsForm from "@/components/studentDetails/StudentDetailsForm";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveForms, getUserLocations } from "@/utils/actions";
import { UserLocation } from "@prisma/client";

const DetailsPage = async ({
  params,
}: {
  params: { id: string; name: string };
}) => {
  const { id: teacherId, name } = await params;
  const decodedName = decodeURIComponent(name);
  const joinedWithTeacherCode = teacherId !== "0" && name !== "notapplicable";
  const title = joinedWithTeacherCode
    ? `You have joined ${decodedName}'s class`
    : `Please enter the details below to continue`;

  const formTitles = await getActiveForms();
  let teacherLocations: UserLocation[] = [];
  if (joinedWithTeacherCode) {
    teacherLocations = await getUserLocations(teacherId);
  }

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-lg">
        <CardContent>
          <h3 className="font-semibold mb-6">{title}</h3>
          <StudentDetailsForm
            teacherLocations={teacherLocations}
            formTitles={[...formTitles]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailsPage;
