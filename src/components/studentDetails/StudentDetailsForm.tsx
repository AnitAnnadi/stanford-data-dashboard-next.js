import SelectInput from "../form/SelectInput";
import { UserLocation } from "@prisma/client";
import SchoolAndPeriodInput from "./SchoolAndPeriodInput";
import { SubmitButton } from "../form/Buttons";

const StudentDetailsForm = ({
  teacherLocations,
  formTitles,
}: {
  teacherLocations: UserLocation[];
  formTitles: string[];
}) => {
  const grades = Array.from({ length: 12 }, (_, i) => {
    return { text: (i + 1).toString(), value: (i + 1).toString() };
  });
  grades.unshift({ text: "k", value: "k" });
  grades.push({ text: "college or above", value: "college or above" });

  const formOptions = formTitles.map((title) => ({
    text: title,
    value: title,
  }));

  const types = [
    { text: "before lesson", value: "pre" },
    { text: "after lesson", value: "post" },
  ];

  return (
    <form>
      {teacherLocations.length > 0 && (
        <SchoolAndPeriodInput teacherLocations={teacherLocations} />
      )}
      <SelectInput
        name="grade"
        placeholder="select your grade"
        options={grades}
      />
      <SelectInput
        name="title"
        placeholder="select your form"
        options={formOptions}
      />
      <SelectInput
        name="type"
        placeholder="select when you are taking this form"
        options={types}
      />
      <SubmitButton className="w-full mt-4" />
    </form>
  );
};

export default StudentDetailsForm;
