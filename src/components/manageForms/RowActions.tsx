import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";
import { ConfirmBeforeProceedingBtn } from "../form/Buttons";
import { deleteForm } from "@/utils/actions";
import { CgTrash } from "react-icons/cg";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "sonner";

const RowActions = ({
  formId,
  formTitle,
  formType,
}: {
  formId: string;
  formTitle: string;
  formType: "pre-survey" | "post-survey";
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <HiOutlineDotsHorizontal className="text-lg" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="bottom">
        <DropdownMenuItem>
          <button
            className="flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/student/enterCode/${formId}`
              );
              toast.success(
                `Copied ${formType} link for "${formTitle}" to clipboard`
              );
            }}
          >
            <IoCopyOutline />
            Copy Link
          </button>
        </DropdownMenuItem>
        <Link href={`/dashboard/manageForms/editForm/${formId}`}>
          <DropdownMenuItem>
            <CiEdit />
            Edit
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem asChild>
          <ConfirmBeforeProceedingBtn
            text="delete form"
            action={deleteForm.bind(null, { formId })}
          >
            <button className="w-full flex gap-x-2 items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
              <CgTrash /> Delete
            </button>
          </ConfirmBeforeProceedingBtn>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RowActions;
