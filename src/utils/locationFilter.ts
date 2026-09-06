// Shared geography scoping for the metrics and export paths.
//
// Prisma's `mode: "insensitive"` compiles to an unescaped Mongo $regex, so
// districts like "DOUGLAS UNIFIED DISTRICT (4174)" match nothing and unbalanced
// parens throw. Escape and anchor it here instead. Case-insensitivity is still
// needed: some cities and schools are stored in mixed case.

import { Roles } from "@prisma/client";

export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const equalsInsensitive = (value: string) => ({
  $regex: `^${escapeRegex(value)}$`,
  $options: "i",
});

export type AdminGeography = {
  country: string;
  state: string | null;
  county: string | null;
  district: string | null;
  city: string | null;
  school: string | null;
};

const UNITED_STATES = "UNITED STATES";

// The field that defines each tier. Missing it means the clamp would land at a
// broader level than the role allows, so callers treat a null result as no scope.
//
// state/county/district are only collected for US locations — every non-US row
// stores them as null by design (see getRequiredLocationFields). For those, the
// country is the narrowest level that exists, so an admin at one of those tiers
// scopes to their country rather than being denied. Inside the US the same null
// is a real gap and still denies.
export const definingFieldFor = (role: Roles, location: AdminGeography) => {
  if (role === Roles.site) return location.school;
  if (role === Roles.country) return location.country;

  const tierField =
    role === Roles.district
      ? location.district
      : role === Roles.county
        ? location.county
        : location.state;

  if (tierField) return tierField;
  return location.country === UNITED_STATES ? null : location.country;
};

// Unescaped values an admin of `role` is clamped to. Plain strings so they can
// drive both a Mongo regex filter and the export path's in-app comparison.
export const scopeForRole = (
  role: Roles,
  location: AdminGeography
): Record<string, string> => {
  const geo: Record<string, string> = { country: location.country };

  if (role !== Roles.country && location.state) geo.state = location.state;
  if (role === Roles.county || role === Roles.district || role === Roles.site) {
    if (location.county) geo.county = location.county;
  }
  if (role === Roles.district || role === Roles.site) {
    if (location.district) geo.district = location.district;
  }
  if (role === Roles.site) {
    if (location.city) geo.city = location.city;
    if (location.school) geo.school = location.school;
  }

  return geo;
};
