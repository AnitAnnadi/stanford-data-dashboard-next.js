import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Separator } from "../ui/separator";
import StanfordAdminCardBtns from "./StanfordAdminCardBtns";

type PendingStanfordUser = {
  id: string;
  name: string;
  email: string;
};

const StanfordAdminCard = ({ user }: { user: PendingStanfordUser }) => {
  return (
    <Card className="mb-5">
      <CardContent>
        <h4 className="font-medium text-lg mb-2">{user.name}</h4>
        <div className="mb-4 text-muted-foreground">
          <p>{user.email}</p>
          <p>Requested role: Stanford admin</p>
        </div>
        <Separator />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <StanfordAdminCardBtns userId={user.id} />
      </CardFooter>
    </Card>
  );
};

export default StanfordAdminCard;
