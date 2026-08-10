"use client";

import { renderError } from "../helpers";
import { getUser } from "@/utils/actions";

export const downloadData = async (paramsObj: Record<string, string>) => {
  try {
    const params = new URLSearchParams(paramsObj);
    const { role, userId } = await getUser();

    if (userId) params.append("userId", userId);
    if (role) params.append("role", role);

    const url = `/api/exportData?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to export data");

    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `REACH_Lab_Export_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(downloadUrl);

    return { success: true };
  } catch (error) {
    return renderError(error);
  }
};

export const downloadUsers = async () => {
  try {
    // No role is passed: /api/exportUsers authorizes from the session cookies,
    // since this export exposes every user's email address.
    const res = await fetch("/api/exportUsers");
    if (!res.ok) {
      throw new Error(
        res.status === 401 || res.status === 403
          ? "You are not authorized to export users"
          : "Failed to export users"
      );
    }

    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `REACH_Lab_Users_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(downloadUrl);

    return { success: true };
  } catch (error) {
    return renderError(error);
  }
};