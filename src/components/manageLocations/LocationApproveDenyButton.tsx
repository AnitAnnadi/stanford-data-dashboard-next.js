import { actionFunction, btnVariant } from "@/utils/types";
import FormContainer from "../form/FormContainer";
import { SubmitButton } from "../form/Buttons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";

const LocationApproveDenyButton = ({
  text,
  variant = "default",
  action,
}: {
  text: string;
  variant?: btnVariant;
  action: actionFunction;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant}>{text}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to proceed?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will finalize your decision
            regarding this location request.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <FormContainer action={action}>
              <SubmitButton text={text} size="default" />
            </FormContainer>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LocationApproveDenyButton;
