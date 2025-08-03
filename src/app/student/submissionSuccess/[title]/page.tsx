"use client";

import TitleInput from "@/components/addForm/TitleInput";
import { usePathname } from "next/navigation";
import React from "react";

const SubmissionSuccessPage = () => {
  localStorage.removeItem("studentLocation");
  localStorage.removeItem("studentDetails");

  const title = decodeURIComponent(usePathname().split("/")[3]);

  return (
    <div className="w-full mx-auto p-8 max-w-3xl">
      <TitleInput
        defaultValue={title}
        description="Your response has been recorded."
        disabled={true}
      />
    </div>
  );
};

export default SubmissionSuccessPage;
