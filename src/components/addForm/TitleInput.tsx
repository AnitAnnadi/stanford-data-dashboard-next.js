"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const TitleInput = ({
  defaultValue = "Untitled form",
  disabled = false,
  description,
}: {
  defaultValue?: string;
  disabled?: boolean;
  description?: string;
}) => {
  const [title, setTitle] = useState(defaultValue);

  return (
    <Card className="border-t-6 border-t-primary">
      <CardContent>
        <input
          type="text"
          name="title"
          placeholder="Form title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full text-3xl pb-2 transition-colors duration-200 ease-in-out focus:border-primary focus:outline-none ${disabled ? "" : "border-b-2"}`}
          disabled={disabled}
          required
        />
        {description && (
          <div>
            <p className="mt-4">{description}</p>
            <Button variant="link" className="mt-2 pl-0" asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleInput;
