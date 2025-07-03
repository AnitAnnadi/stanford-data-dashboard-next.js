import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleOptions = [
  {
    role: "teacher",
    label: "teacher",
    international: true,
  },
  {
    role: "site",
    label: "site admin",
    international: true,
  },
  {
    role: "district",
    label: "district admin",
    international: false,
  },
  {
    role: "county",
    label: "county admin",
    international: false,
  },
  {
    role: "state",
    label: "state admin",
    international: false,
  },
  {
    role: "country",
    label: "country admin",
    international: true,
  },
  {
    role: "stanford",
    label: "stanford admin",
    international: false,
  },
  {
    role: "site-teacher",
    label: "site Admin & Teacher",
    international: true,
  },
  {
    role: "district-teacher",
    label: "district admin & teacher",
    international: false,
  },
  {
    role: "county-teacher",
    label: "county admin & teacher",
    international: false,
  },
  {
    role: "state-teacher",
    label: "state admin & teacher",
    international: false,
  },
];

const SelectRole = ({ country }: { country: string }) => {
  return (
    <Select name="role" required>
      <SelectTrigger className="w-full mt-3 capitalize">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Role</SelectLabel>
          {roleOptions.map((role) => {
            if (country !== "United States" && !role.international) {
              return;
            }

            return (
              <SelectItem
                value={role.role}
                key={role.role}
                className="capitalize"
              >
                {role.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectRole;
