import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

const MultiplePeriodsCheckbox = () => {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <input
        name="multiplePeriods"
        type="hidden"
        value={checked ? "true" : "false"}
      />
      <div className="flex items-center gap-3 mt-4">
        <Checkbox
          id="multiplePeriods"
          checked={checked}
          onCheckedChange={(val) => setChecked(!!val)}
        />
        <Label htmlFor="multiplePeriods">
          I teach multiple classes/periods at this location
        </Label>
      </div>
    </>
  );
};

export default MultiplePeriodsCheckbox;
