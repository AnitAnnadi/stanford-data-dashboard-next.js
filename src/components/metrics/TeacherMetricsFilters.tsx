"use client";
import { UserLocation } from "@prisma/client";
import { useState } from "react";
import FormContainer from "../form/FormContainer";
import LocationComboBox from "../selectCreateLocation/LocationComboBox";
import { Label } from "../ui/label";
import SelectInput from "../form/SelectInput";
import { downloadData } from "@/utils/actions";
import { SubmitButton } from "../form/Buttons";
import { useEffect } from "react";

const TeacherMetricsFilters = ({
  teacherLocations,
  forms,
}: {
  teacherLocations: UserLocation[];
  forms: string[];
}) => {
  const [location, setLocation] = useState({
    country: "All",
    state: "All",
    county: "All",
    district: "All",
    city: "All",
    school: "All",
  });

  const onlyUnitedStates = teacherLocations.every(
    (location) => location.country === "United States"
  );
  const oneLocation = teacherLocations.length === 1;
  useEffect(() => {
    if (oneLocation) {
      const singleLocation: {
        country: string;
        state: string;
        county: string;
        district: string;
        city: string;
        school: string;
      } = {
        country: teacherLocations[0].country,
        state: "All",
        county: "All",
        district: "All",
        city: teacherLocations[0].city as string,
        school: teacherLocations[0].school as string,
      };

      if (onlyUnitedStates) {
        singleLocation.state = teacherLocations[0].state as string;
        singleLocation.county = teacherLocations[0].county as string;
        singleLocation.district = teacherLocations[0].district as string;
      }

      setLocation(singleLocation);
    }

    if (onlyUnitedStates) {
      setLocation((prev) => ({
        ...prev,
        country: "United States",
      }));
    }
  }, [teacherLocations]);

  const isUSA = location.country === "United States";
  const countries = [
    ...new Set(teacherLocations.map((location) => location.country)),
  ];
  const states = [
    ...new Set(
      teacherLocations
        .filter((t) => t.country === "United States")
        .map((t) => t.state)
        .filter((state): state is string => state !== null)
    ),
  ];
  const [counties, setCounties] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [schools, setSchools] = useState<string[]>([]);

  useEffect(() => {
    if (onlyUnitedStates || oneLocation) return;

    setLocation((prev) => ({
      ...prev,
      state: "All",
      county: "All",
      city: "All",
      district: "All",
    }));

    setCounties([]);
    setDistricts([]);
    setCities([]);
    setSchools([]);

    if (!isUSA && location.country !== "All") {
      const cities = teacherLocations
        .filter((t) => t.country === location.country)
        .map((t) => t.city)
        .filter((city): city is string => city !== null);
      setCities(cities);
    }
  }, [location.country]);

  useEffect(() => {
    if (oneLocation) return;

    setLocation((prev) => ({
      ...prev,
      county: "All",
      city: "All",
      district: "All",
      school: "All",
    }));
    setDistricts([]);
    setCities([]);
    setSchools([]);

    if (location.state !== "All") {
      const counties = teacherLocations
        .filter(
          (t) => t.country === location.country && t.state === location.state
        )
        .map((t) => t.county)
        .filter((county): county is string => county !== null);
      setCounties([...new Set(counties)]);
    }
  }, [location.state]);

  useEffect(() => {
    if (oneLocation) return;

    setLocation((prev) => ({
      ...prev,
      district: "All",
      city: "All",
      school: "All",
    }));
    setCities([]);
    setSchools([]);

    if (location.county !== "All") {
      const districts = teacherLocations
        .filter(
          (t) =>
            t.country === location.country &&
            t.state === location.state &&
            t.county === location.county
        )
        .map((t) => t.district)
        .filter((district): district is string => district !== null);
      setDistricts([...new Set(districts)]);
    }
  }, [location.county]);

  useEffect(() => {
    if (oneLocation) return;

    setLocation((prev) => ({ ...prev, city: "All", school: "All" }));
    setSchools([]);

    if (location.district !== "All") {
      const cities = teacherLocations
        .filter(
          (t) =>
            t.country === location.country &&
            t.state === location.state &&
            t.county === location.county &&
            t.district === location.district
        )
        .map((t) => t.city)
        .filter((city): city is string => city !== null);
      setCities([...new Set(cities)]);
    }
  }, [location.district]);

  useEffect(() => {
    if (oneLocation) return;

    setLocation((prev) => ({ ...prev, school: "All" }));

    if (location.city !== "All") {
      const schools = teacherLocations
        .filter((t) => {
          if (isUSA) {
            return (
              t.country === location.country &&
              t.state === location.state &&
              t.county === location.county &&
              t.district === location.district &&
              t.city === location.city
            );
          } else {
            return t.country === location.country && t.city === location.city;
          }
        })
        .map((t) => t.school)
        .filter((school): school is string => school !== null);

      setSchools(schools);
    }
  }, [location.city]);

  return (
    <FormContainer action={downloadData}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-4">
        <div>
          <Label>Country</Label>
          <LocationComboBox
            name="country"
            value={location.country}
            onChange={(country) =>
              setLocation((prev) => ({ ...prev, country }))
            }
            options={
              oneLocation || onlyUnitedStates
                ? [location.country]
                : ["All", ...countries]
            }
          />
        </div>
        {isUSA && (
          <>
            <div>
              <Label>State</Label>
              <LocationComboBox
                name="state"
                value={location.state}
                onChange={(state) =>
                  setLocation((prev) => ({ ...prev, state }))
                }
                options={oneLocation ? [location.state] : ["All", ...states]}
              />
            </div>
            <div>
              <Label>County</Label>
              <LocationComboBox
                name="county"
                value={location.county}
                onChange={(county) =>
                  setLocation((prev) => ({ ...prev, county }))
                }
                options={oneLocation ? [location.county] : ["All", ...counties]}
              />
            </div>
            <div>
              <Label>District</Label>
              <LocationComboBox
                name="district"
                value={location.district}
                onChange={(district) =>
                  setLocation((prev) => ({ ...prev, district }))
                }
                options={
                  oneLocation ? [location.district] : ["All", ...districts]
                }
              />
            </div>
          </>
        )}
        <div>
          <Label>City</Label>
          <LocationComboBox
            name="city"
            value={location.city}
            onChange={(city) => setLocation((prev) => ({ ...prev, city }))}
            options={oneLocation ? [location.city] : ["All", ...cities]}
          />
        </div>
        <div>
          <Label>School</Label>
          <LocationComboBox
            name="school"
            value={location.school}
            onChange={(school) => setLocation((prev) => ({ ...prev, school }))}
            options={oneLocation ? [location.school] : ["All", ...schools]}
          />
        </div>
        <div>
          <Label>Form</Label>
          <SelectInput
            name="form"
            placeholder="Select a form"
            options={[
              { text: "All", value: "All" },
              ...forms.map((form) => ({ text: form, value: form })),
            ]}
            defaultValue="All"
            withMargin={false}
          />
        </div>
        <SubmitButton text="export data" size="default" className="self-end" />
      </div>
    </FormContainer>
  );
};

export default TeacherMetricsFilters;
