import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { SubmitButton } from "@/components/form/Buttons";
import { login } from "@/utils/actions";
import Logo from "@/components/global/Logo";

const LoginPage = () => {
  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-sm">
        <Logo />
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email and password to login{" "}
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FormContainer action={login}>
            <FormInput
              name="email"
              type="email"
              defaultValue="anitannadi@gmail.com"
            />
            <FormInput
              name="password"
              type="password"
              defaultValue="batman123"
            />
            <SubmitButton text="login" className="w-full mt-4" />
          </FormContainer>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="px-0" asChild>
            <Link href="/forgotPassword">Forgot Password</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
