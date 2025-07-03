import { UserLocation, Roles } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoPlus } from "react-icons/go";
import Link from "next/link";

const ShowUserLocations = ({
  role,
  isTeacher,
  userLocations,
  showAddUserLocation,
}: {
  role: Roles;
  isTeacher: boolean;
  userLocations: UserLocation[];
  showAddUserLocation: boolean;
}) => {
  return (
    <>
      <div className="flex items-center gap-1 mb-2">
        <h4 className="text-lg font-medium">Locations</h4>
        {showAddUserLocation && (
          <Button className="h-5 w-5" asChild>
            <Link href="/selectUserLocation">
              <GoPlus />
            </Link>
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {userLocations.map((userLocation) => {
          let displayUserLocation = "";

          if (isTeacher || role === Roles.site) {
            displayUserLocation = `${userLocation.school}, ${userLocation.city}, `;
          } else if (role === Roles.county) {
            displayUserLocation = `${userLocation.county}, `;
          } else if (role === Roles.district) {
            displayUserLocation = `${userLocation.district}, `;
          }

          if (userLocation.state) {
            displayUserLocation += `${userLocation.state}, `;
          }

          displayUserLocation += `${userLocation.country}`;

          return (
            <Badge
              key={userLocation.id}
              variant="secondary"
              className="text-[15px]"
            >
              {displayUserLocation}
            </Badge>
          );
        })}
      </div>
    </>
  );
};

export default ShowUserLocations;
