"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { SubmitButton } from "@/components/form/Buttons";
import { register } from "@/utils/actions";
import { useState } from "react";
import LocationComboBox from "@/components/selectCreateLocation/LocationComboBox";
import countries from "@/data/countries";
import SelectRole from "@/components/register/SelectRole";
import Image from "next/image";

const RegisterPage = () => {
  const [country, setCountry] = useState("United States");

  return (
    <div className="grid h-lvh place-items-center">
      <Card className="w-full max-w-sm">
        {/* <div
            style={{
              position: "fixed",
              bottom: "20px", // distance from bottom
              right: "20px", // distance from right
              zIndex: 1000, // make sure it's on top of other elements
            }}
          >
            <Image src={"/image001.png"} alt="Logo" width={300} height={200} />
          </div> */}

        <Image src={"/image001.png"} alt="Logo" width={300} height={200} />
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Enter your name, email, and role to register
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FormContainer action={register}>
            <FormInput name="name" type="text" />
            <FormInput name="email" type="email" />
            <FormInput name="password" type="password" />
            <FormInput
              name="confirmPassword"
              type="password"
              label="confirm password"
            />
            <LocationComboBox
              name="country"
              value={country}
              onChange={(country) => setCountry(country)}
              options={countries}
              marginBottom={0}
            />
            <SelectRole country={country} />
            <SubmitButton text="register" className="w-full mt-4" />
          </FormContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
