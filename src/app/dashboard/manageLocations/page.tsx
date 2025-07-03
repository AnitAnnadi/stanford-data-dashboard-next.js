import EmptyList from "@/components/global/EmptyList";
import LocationCard from "@/components/manageLocations/LocationCard";
import { getPendingUserLocations } from "@/utils/actions";
import React from "react";

const ManageLocationsPage = async () => {
  const userLocations = await getPendingUserLocations();

  return (
    <div>
      {userLocations.length === 0 ? (
        <EmptyList heading="No location requests pending approval." />
      ) : (
        <>
          {userLocations.map((userLocation) => {
            return (
              <LocationCard key={userLocation.id} location={userLocation} />
            );
          })}
        </>
      )}
    </div>
  );
};

export default ManageLocationsPage;
