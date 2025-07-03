"use client";
import FormContainer from "@/components/form/FormContainer";
import { SubmitButton } from "@/components/form/Buttons";
import { addUserLocation } from "@/utils/actions";
import { useState, useEffect } from "react";
import countries from "@/data/countries";
import states from "@/data/states";
import {
  getRequiredLocationFields,
  narrowByState,
  narrowCitiesByCountry,
  narrowDistricts,
  narrowSchools,
} from "@/utils/locationFilters";
import LocationComboBox from "@/components/location/LocationComboBox";
import MultiplePeriodsCheckbox from "@/components/location/MultiplePeriodsCheckbox";
import { Roles } from "@prisma/client";

const SelectUserLocationForm = ({
  role,
  isTeacher,
}: {
  role: Roles;
  isTeacher: boolean;
}) => {
  const [userLocation, setUserLocation] = useState({
    country: "United States",
    state: "",
    county: "",
    city: "",
    district: "",
    school: "",
  });

  const {
    canAccessNonUS,
    isUSA,
    requireState,
    requireCounty,
    requireDistrict,
    requireCityAndSchool,
  } = getRequiredLocationFields({
    country: userLocation.country,
    role,
    isTeacher,
  });

  let displayCountries = countries;
  if (!canAccessNonUS) {
    displayCountries = ["United States"];
  }

  const [counties, setCounties] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [schools, setSchools] = useState<string[]>([]);

  useEffect(() => {
    setUserLocation((prev) => ({
      ...prev,
      state: "",
      county: "",
      city: "",
      district: "",
      school: "",
    }));

    setCounties([]);
    setCities([]);
    setDistricts([]);
    setSchools([]);

    if (!isUSA && requireCityAndSchool) {
      setCities(narrowCitiesByCountry({ country: userLocation.country }));
    }
  }, [userLocation.country]);

  useEffect(() => {
    setUserLocation((prev) => ({
      ...prev,
      county: "",
      city: "",
      district: "",
      school: "",
    }));

    setSchools([]);
    setDistricts([]);

    if (userLocation.state) {
      if (requireCityAndSchool)
        setCities(
          narrowByState({
            state: userLocation.state,
            region: "city",
          })
        );
      else if (requireCounty)
        setCounties(
          narrowByState({
            state: userLocation.state,
            region: "county",
          })
        );
    }
  }, [userLocation.state]);

  useEffect(() => {
    setUserLocation((prev) => ({ ...prev, district: "" }));

    if (userLocation.county && requireDistrict) {
      setDistricts(
        narrowDistricts({
          state: userLocation.state,
          county: userLocation.county,
        })
      );
    }
  }, [userLocation.county]);

  useEffect(() => {
    setUserLocation((prev) => ({ ...prev, school: "" }));
    if (userLocation.city) {
      setSchools(
        narrowSchools({
          country: userLocation.country,
          state: userLocation.state,
          city: userLocation.city,
        })
      );
    }
  }, [userLocation.city]);

  return (
    <FormContainer action={addUserLocation}>
      <input type="hidden" name="role" value={role} />
      <input
        type="hidden"
        name="isTeacher"
        value={isTeacher ? "true" : "false"}
      />
      <LocationComboBox
        name="country"
        value={userLocation.country}
        onChange={(country) =>
          setUserLocation((prev) => ({ ...prev, country }))
        }
        options={displayCountries}
      />
      {requireState && (
        <LocationComboBox
          name="state"
          value={userLocation.state}
          onChange={(state) => setUserLocation((prev) => ({ ...prev, state }))}
          options={states}
        />
      )}
      {requireCounty && (
        <LocationComboBox
          name="county"
          value={userLocation.county}
          onChange={(county) =>
            setUserLocation((prev) => ({ ...prev, county }))
          }
          options={counties}
        />
      )}
      {requireDistrict && (
        <LocationComboBox
          name="district"
          value={userLocation.district}
          onChange={(district) =>
            setUserLocation((prev) => ({ ...prev, district }))
          }
          options={districts}
        />
      )}
      {requireCityAndSchool && (
        <>
          <LocationComboBox
            name="city"
            value={userLocation.city}
            onChange={(city) => setUserLocation((prev) => ({ ...prev, city }))}
            options={cities}
          />
          <LocationComboBox
            name="school"
            value={userLocation.school}
            onChange={(school) =>
              setUserLocation((prev) => ({ ...prev, school }))
            }
            options={schools}
          />
        </>
      )}
      <MultiplePeriodsCheckbox />
      <SubmitButton text="add location" className="w-full mt-4" />
    </FormContainer>
  );
};

export default SelectUserLocationForm;
