import schoolData from "../data/school-data.json";
import { location } from "./types";
import { Roles } from "@prisma/client";

export const getRequiredLocationFields = ({
  country,
  role,
  isTeacher,
}: {
  country: string;
  role: Roles;
  isTeacher: boolean;
}) => {
  const isUSA = country === "United States";

  return {
    canAccessNonUS:
      role === Roles.country || role === Roles.site || Roles.teacher,
    isUSA,
    requireState: isUSA && role !== Roles.country,
    requireCounty:
      isUSA && (role === Roles.county || role === Roles.district) && !isTeacher,
    requireDistrict: isUSA && role === Roles.district && !isTeacher,
    requireCityAndSchool: role === Roles.site || isTeacher,
  };
};

export type Region = "county" | "city";

export const narrowByState = ({
  state,
  region,
}: {
  state: string;
  region: Region;
}) => {
  const locations = (schoolData as location[]).filter((location) => {
    if (location.state) {
      return state.toLocaleLowerCase() === location.state.toLocaleLowerCase();
    }

    return false;
  });

  const names = locations
    .map((location) => location[region])
    .filter((name): name is string => name !== undefined)
    .sort();

  return [...new Set(names)];
};

export const narrowCitiesByCountry = ({ country }: { country: string }) => {
  const cities = (schoolData as location[])
    .filter((location) => {
      if (location.country) {
        return (
          country.toLocaleLowerCase() === location.country.toLocaleLowerCase()
        );
      }

      return false;
    })
    .map((location) => location.city)
    .sort();

  return [...new Set(cities)];
};

export const narrowDistricts = ({
  state,
  county,
}: {
  state: string;
  county: string;
}) => {
  const districts = (schoolData as location[]).filter((location) => {
    if (location.state && location.county) {
      return (
        state.toLocaleLowerCase() === location.state.toLocaleLowerCase() &&
        county.toLocaleLowerCase() === location.county.toLocaleLowerCase()
      );
    }

    return false;
  });

  const districtNames = districts
    .map((district) => district.district)
    .filter((name): name is string => name !== undefined)
    .sort();

  return [...new Set(districtNames)];
};

export const narrowSchools = ({
  country,
  state,
  city,
}: {
  country: string;
  state?: string;
  city: string;
}) => {
  let schools = schoolData as location[];

  if (state && country === "United States") {
    schools = schools.filter((location) => {
      if (location.state) {
        return (
          state.toLocaleLowerCase() === location.state.toLocaleLowerCase() &&
          city.toLocaleLowerCase() === location.city.toLocaleLowerCase()
        );
      }

      return false;
    });
  } else {
    schools = schools.filter((location) => {
      if (location.country) {
        return (
          country.toLocaleLowerCase() ===
            location.country.toLocaleLowerCase() &&
          city.toLocaleLowerCase() === location.city.toLocaleLowerCase()
        );
      }

      return false;
    });
  }

  const schoolNames = schools.map((location) => location.name).sort();

  return [...new Set(schoolNames)];
};

export const narrowCitiesByStateCountyDistrict = ({
  state,
  county,
  district,
}: {
  state: string;
  county: string;
  district: string;
}) => {
  const cities = (schoolData as location[])
    .filter((location) => {
      if (location.state && location.county && location.district) {
        return (
          state.toLocaleLowerCase() === location.state.toLocaleLowerCase() &&
          county.toLocaleLowerCase() === location.county.toLocaleLowerCase() &&
          district.toLocaleLowerCase() === location.district.toLocaleLowerCase()
        );
      }

      return false;
    })
    .map((city) => city.city)
    .sort();

  return [...new Set(cities)];
};

export const findLocation = ({
  state,
  city,
  school,
}: {
  state: string;
  city: string;
  school: string;
}) => {
  const location = (schoolData as location[]).filter((location) => {
    if (location.state) {
      return (
        state.toLocaleLowerCase() === location.state.toLocaleLowerCase() &&
        city.toLocaleLowerCase() === location.city.toLocaleLowerCase() &&
        school.toLocaleLowerCase() === location.name.toLocaleLowerCase()
      );
    }

    return false;
  });

  return {
    county: location[0].county as string,
    district: location[0].district as string,
  };
};
