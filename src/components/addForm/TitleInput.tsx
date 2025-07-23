"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const TitleInput = ({
  defaultValue = "Untitled form",
}: {
  defaultValue?: string;
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
          className="w-full text-3xl pb-2 border-b-2 transition-colors duration-200 ease-in-out focus:border-primary focus:outline-none"
          required
        />
      </CardContent>
    </Card>
  );
};

export default TitleInput;
