import ResetPasswordForm from "./reset-password-form";
export default function Page({ searchParams }: any) {
  const token = searchParams?.token;
  return <ResetPasswordForm token={token} />;
}
