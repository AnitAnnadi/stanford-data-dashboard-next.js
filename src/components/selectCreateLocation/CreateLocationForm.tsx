"use client";
import { useEffect, useState } from "react";
import FormContainer from "../form/FormContainer";
import { createLocation } from "@/utils/actions";
import countries from "@/data/countries";
import LocationComboBox from "./LocationComboBox";
import states from "@/data/states";
import FormInput from "../form/FormInput";
import {
  narrowByState,
  narrowCitiesByStateCountyDistrict,
  narrowDistricts,
} from "@/utils/locationFilters";
import { Roles } from "@prisma/client";
import MultiplePeriodsCheckbox from "./MultiplePeriodsCheckbox";
import { SubmitButton } from "../form/Buttons";
import { Input } from "../ui/input";

const CreateLocationForm = ({
  role,
  isTeacher,
}: {
  role: Roles;
  isTeacher: boolean;
}) => {
  const [location, setLocation] = useState({
    country: "United States",
    state: "",
    county: "",
    city: "",
    district: "",
    school: "",
  });

  const [counties, setCounties] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const isUSA = location.country === "United States";

  useEffect(() => {
    setLocation((prev) => ({
      ...prev,
      state: "",
      county: "",
      city: "",
      district: "",
    }));

    setCounties([]);
    setDistricts([]);
    setCities([]);
  }, [location.country]);

  useEffect(() => {
    setLocation((prev) => ({
      ...prev,
      county: "",
      city: "",
      district: "",
    }));

    setDistricts([]);
    setCities([]);

    if (location.state) {
      setCounties(
        narrowByState({
          state: location.state,
          region: "county",
        })
      );
    }
  }, [location.state]);

  useEffect(() => {
    setLocation((prev) => ({ ...prev, district: "", city: "" }));
    setCities([]);

    if (location.county) {
      setDistricts(
        narrowDistricts({ state: location.state, county: location.county })
      );
    }
  }, [location.county]);

  useEffect(() => {
    setLocation((prev) => ({ ...prev, city: "" }));

    if (location.district) {
      setCities(
        narrowCitiesByStateCountyDistrict({
          state: location.state,
          county: location.county,
          district: location.district,
        })
      );
    }
  }, [location.district]);

  return (
    <FormContainer action={createLocation}>
      <Input type="hidden" name="role" value={role} />
      <Input
        type="hidden"
        name="isTeacher"
        value={isTeacher ? "true" : "false"}
      />
      <LocationComboBox
        name="country"
        value={location.country}
        onChange={(country) => setLocation((prev) => ({ ...prev, country }))}
        options={countries}
      />
      {isUSA && (
        <>
          <LocationComboBox
            name="state"
            value={location.state}
            onChange={(state) => setLocation((prev) => ({ ...prev, state }))}
            options={states}
          />
          <LocationComboBox
            name="county"
            value={location.county}
            onChange={(county) => setLocation((prev) => ({ ...prev, county }))}
            options={counties}
          />
          <LocationComboBox
            name="district"
            value={location.district}
            onChange={(district) =>
              setLocation((prev) => ({ ...prev, district }))
            }
            options={districts}
          />
          <LocationComboBox
            name="city"
            value={location.city}
            onChange={(city) => setLocation((prev) => ({ ...prev, city }))}
            options={cities}
          />
        </>
      )}
      {!isUSA && (
        <FormInput name="city" type="text" placeholder="Enter your city name" />
      )}
      <FormInput
        name="school"
        type="text"
        placeholder="Enter your school name"
      />
      <MultiplePeriodsCheckbox />
      <SubmitButton text="request location" className="w-full mt-4" />
    </FormContainer>
  );
};

export default CreateLocationForm;
