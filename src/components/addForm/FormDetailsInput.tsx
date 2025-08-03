import React from "react";
import { Card, CardContent } from "../ui/card";
import SelectInput from "../form/SelectInput";

type DefaultValues = {
  type?: string;
  active?: string;
  provideCertificate?: string;
};

const FormDetailsInput = ({
  defaultValues = {},
  disableType = false,
}: {
  defaultValues?: DefaultValues;
  disableType?: boolean;
}) => {
  const types = [
    { text: "pre-survey", value: "pre" },
    { text: "post-survey", value: "post" },
  ];

  const provideCertificateOptions = [
    { text: "yes", value: "true" },
    { text: "no", value: "false" },
  ];

  const statuses = [
    { text: "active", value: "true" },
    { text: "inactive", value: "false" },
  ];

  return (
    <Card className="mt-4">
      <CardContent>
        <SelectInput
          name="type"
          placeholder="select the form type"
          options={types}
          defaultValue={defaultValues.type}
          disabled={disableType}
          withMargin={false}
        />
        <SelectInput
          name="active"
          label="status"
          placeholder="select active status"
          defaultValue={defaultValues.active}
          options={statuses}
        />
        <SelectInput
          name="provideCertificate"
          label="provide certificate"
          placeholder="should students recieve a certificate after submitting?"
          defaultValue={defaultValues.provideCertificate}
          options={provideCertificateOptions}
        />
      </CardContent>
    </Card>
  );
};

export default FormDetailsInput;
