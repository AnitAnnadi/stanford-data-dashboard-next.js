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

const RowActions = ({ formId }: { formId: string }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <HiOutlineDotsHorizontal className="text-lg" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="bottom">
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
