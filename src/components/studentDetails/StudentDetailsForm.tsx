import { Button } from "@/components/ui/button";
import SelectInput from "../form/SelectInput";
import { UserLocation } from "@prisma/client";
import SchoolAndPeriodInput from "./SchoolAndPeriodInput";

const StudentDetailsForm = ({
  teacherLocations,
}: {
  teacherLocations: UserLocation[];
}) => {
  const grades = Array.from({ length: 12 }, (_, i) => {
    return { text: (i + 1).toString(), value: (i + 1).toString() };
  });
  grades.unshift({ text: "k", value: "k" });
  grades.push({ text: "college or above", value: "college or above" });

  const types = [
    { text: "before lesson", value: "pre" },
    { text: "after lesson", value: "post" },
  ];

  return (
    <div>
      <SchoolAndPeriodInput teacherLocations={teacherLocations} />
      <SelectInput
        name="grade"
        placeholder="select your grade"
        options={grades}
      />
      <SelectInput
        name="type"
        placeholder="select when you are taking this form"
        options={types}
      />
      <Button className="w-full mt-4">Submit</Button>
    </div>
  );
};

export default StudentDetailsForm;
