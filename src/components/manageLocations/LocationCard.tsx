import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { UserLocationWithUser } from "@/utils/types";
import LocationApproveDenyButton from "./LocationApproveDenyButton";
import {
  approveLocationRequest,
  declineLocationRequest,
} from "@/utils/actions";

const LocationCard = ({ location }: { location: UserLocationWithUser }) => {
  const isUSA = location.country === "United States";

  return (
    <Card className="mb-5">
      <CardContent>
        <h4 className="font-medium text-lg mb-2">
          {location.user.name} ({location.user.email})
        </h4>
        <div className="mb-4 text-muted-foreground">
          {isUSA ? (
            <>
              <p>
                {location.school}, {location.city}
              </p>
              <p>
                {location.district}, {location.county}
              </p>
              <p>
                {location.state}, {location.country}
              </p>
            </>
          ) : (
            <>
              <p>{location.school}</p>
              <p>
                {location.city}, {location.country}
              </p>
            </>
          )}
        </div>
        <Separator />
      </CardContent>
      <CardFooter className="gap-x-2">
        <LocationApproveDenyButton
          text="Approve Request"
          action={approveLocationRequest.bind(null, {
            userLocationId: location.id,
          })}
        />
        <LocationApproveDenyButton
          text="Decline Request"
          variant="destructive"
          action={declineLocationRequest.bind(null, {
            userLocationId: location.id,
          })}
        />
        <Button variant="secondary">Decline Request & Add Location</Button>
      </CardFooter>
    </Card>
  );
};

export default LocationCard;
