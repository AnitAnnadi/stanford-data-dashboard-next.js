import { Button } from "../ui/button";
import { approveStanfordUser, declineStanfordUser } from "@/utils/actions";
import { ConfirmBeforeProceedingBtn } from "../form/Buttons";

const StanfordAdminCardBtns = ({ userId }: { userId: string }) => {
  return (
    <>
      <ConfirmBeforeProceedingBtn
        text="approve request"
        action={approveStanfordUser.bind(null, { userId })}
      >
        <Button className="bg-green-600 text-white hover:bg-green-700">
          Approve Request
        </Button>
      </ConfirmBeforeProceedingBtn>
      <ConfirmBeforeProceedingBtn
        text="decline request"
        action={declineStanfordUser.bind(null, { userId })}
      >
        <Button variant="destructive">Decline Request</Button>
      </ConfirmBeforeProceedingBtn>
    </>
  );
};

export default StanfordAdminCardBtns;
