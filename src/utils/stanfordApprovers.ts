import "server-only";

// People allowed to approve/decline Stanford admin requests (e.g. Holly, Scott).
// Configured via the STANFORD_APPROVER_EMAILS env var (comma-separated).
export const getApproverEmails = () =>
  (process.env.STANFORD_APPROVER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isStanfordApproverEmail = (email?: string | null) => {
  if (!email) return false;
  const approvers = getApproverEmails();
  return approvers.length > 0 && approvers.includes(email.toLowerCase());
};
