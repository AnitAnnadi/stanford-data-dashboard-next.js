"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";
import { ConfirmBeforeProceedingBtn } from "../form/Buttons";
import { deleteForm, duplicateForm } from "@/utils/actions";
import { CgTrash } from "react-icons/cg";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type SurveyType = "pre" | "post";

const RowActions = ({
  formId,
  formTitle,
  formType,
}: {
  formId: string;
  formTitle: string;
  formType: "pre-survey" | "post-survey";
}) => {
  const sourceType: SurveyType = formType === "pre-survey" ? "pre" : "post";
  const counterpartType: SurveyType = sourceType === "pre" ? "post" : "pre";

  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateType, setDuplicateType] =
    useState<SurveyType>(counterpartType);
  const [duplicateTitle, setDuplicateTitle] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // Pre and post surveys are paired by identical title, so a copy that flips
  // the type keeps the title as-is; a copy of the same type needs a new one.
  const defaultTitleFor = (type: SurveyType) =>
    type === sourceType ? `Copy of ${formTitle}` : formTitle;

  const handleTypeChange = (value: string) => {
    const type = value as SurveyType;
    setDuplicateType(type);
    if (!titleEdited) setDuplicateTitle(defaultTitleFor(type));
  };

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      const result = await duplicateForm(
        { formId, title: duplicateTitle, type: duplicateType },
        new FormData()
      );
      if ("errorMessage" in result && result.errorMessage) {
        toast.error(result.message);
        return;
      }
      toast.success(
        `Duplicated as ${duplicateType}-survey "${duplicateTitle}"`
      );
      setDuplicateOpen(false);
    } catch {
      toast.error("Failed to duplicate form");
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <HiOutlineDotsHorizontal className="text-lg" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="bottom">
          <DropdownMenuItem
            onSelect={() => {
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
          </DropdownMenuItem>
          <Link href={`/dashboard/manageForms/editForm/${formId}`}>
            <DropdownMenuItem>
              <CiEdit />
              Edit
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onSelect={() => {
              setDuplicateType(counterpartType);
              setDuplicateTitle(defaultTitleFor(counterpartType));
              setTitleEdited(false);
              setDuplicateOpen(true);
            }}
          >
            <IoCopyOutline />
            Duplicate
          </DropdownMenuItem>
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

      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={duplicateType}
              onValueChange={handleTypeChange}
              className="flex gap-x-6"
            >
              <div className="flex items-center gap-x-2">
                <RadioGroupItem value="pre" id="duplicate-type-pre" />
                <Label htmlFor="duplicate-type-pre">pre-survey</Label>
              </div>
              <div className="flex items-center gap-x-2">
                <RadioGroupItem value="post" id="duplicate-type-post" />
                <Label htmlFor="duplicate-type-post">post-survey</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duplicate-title">Title</Label>
            <Input
              id="duplicate-title"
              value={duplicateTitle}
              onChange={(e) => {
                setTitleEdited(true);
                setDuplicateTitle(e.target.value);
              }}
              placeholder="Enter new form name"
            />
            {duplicateType !== sourceType && (
              <p className="text-sm text-muted-foreground">
                Keep the title identical so the two surveys stay paired.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={!duplicateTitle.trim() || duplicating}>
              {duplicating ? "Duplicating..." : "Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RowActions;
