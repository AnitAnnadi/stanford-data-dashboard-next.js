import { Button } from "../ui/button";
import {
  approveLocationRequest,
  declineLocationRequest,
} from "@/utils/actions";
import { ConfirmBeforeProceedingBtn } from "../form/Buttons";

const LocationCardBtns = ({ locationId }: { locationId: string }) => {
  return (
    <>
      <ConfirmBeforeProceedingBtn
        text="approve request"
        action={approveLocationRequest.bind(null, {
          userLocationId: locationId,
        })}
      >
        <Button>Approve Request</Button>
      </ConfirmBeforeProceedingBtn>
      <ConfirmBeforeProceedingBtn
        text="decline request"
        action={declineLocationRequest.bind(null, {
          userLocationId: locationId,
        })}
      >
        <Button variant="destructive">Decline Request</Button>
      </ConfirmBeforeProceedingBtn>
      <Button variant="secondary">Decline Request & Add Location</Button>
    </>
  );
};

export default LocationCardBtns;
