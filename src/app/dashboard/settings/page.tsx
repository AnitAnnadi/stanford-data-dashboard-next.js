import FormInput from "@/components/form/FormInput";
import SectionTitle from "@/components/global/SectionTitle";
import { getUserFromDb, getUserLocations, updateUser } from "@/utils/actions";
import { Roles } from "@prisma/client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import ShowUserLocations from "@/components/settings/ShowUserLocations";
import FormContainer from "@/components/form/FormContainer";
import { SubmitButton } from "@/components/form/Buttons";

const SettingsPage = async () => {
  const { id, name, email, role, isTeacher } = await getUserFromDb();
  const userLocations = await getUserLocations(id);

  const showAddUserLocation = isTeacher && role !== Roles.site;

  let displayRole = role;
  if (displayRole !== Roles.teacher) {
    displayRole += " admin";
  }

  return (
    <div>
      <SectionTitle text="settings" />
      <Alert variant="destructive" className="my-4">
        <AlertCircleIcon />
        <AlertTitle>
          Settings cannot be modified except for your name. If you need help,
          please contact sgerbert@stanford.edu.
        </AlertTitle>
      </Alert>
      <FormContainer action={updateUser}>
        <FormInput name="name" type="text" defaultValue={name} />
        <FormInput
          name="email"
          type="email"
          defaultValue={email}
          disabled={true}
        />
        <FormInput
          name="role"
          type="text"
          defaultValue={displayRole}
          disabled={true}
        />
        <FormInput
          name="isTeacher"
          label="is a teacher?"
          type="text"
          defaultValue={isTeacher.toString()}
          disabled={true}
        />
        {role !== Roles.stanford && (
          <ShowUserLocations
            role={role}
            isTeacher={isTeacher}
            userLocations={userLocations}
            showAddUserLocation={showAddUserLocation}
          />
        )}
        <SubmitButton text="save changes" className="mt-4 w-full" />
      </FormContainer>
    </div>
  );
};

export default SettingsPage;
