"use client";

import { renderError } from "../helpers";
import { getUser } from "@/utils/actions";

export const downloadData = async (prevState: any, formData: FormData) => {
  try {
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value && value !== "All") params.append(key, value.toString());
    }
    const { role, userId } = await getUser();
    if (userId) params.append("userId", userId);
    if (role) params.append("role", role);

    const url = `/api/exportData?${params.toString()}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `REACH_Lab_Export_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { message: "Successfully downloaded data" };
  } catch (error) {
    return renderError(error);
  }
};
