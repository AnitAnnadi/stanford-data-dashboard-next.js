import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationComboBoxProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  marginBottom?: number;
}

const LocationComboBox = ({
  name,
  value,
  onChange,
  options,
  marginBottom = 4,
}: LocationComboBoxProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`mb-${marginBottom}`}>
      <input name={name} value={value} type="hidden" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value ? value : `Select a ${name}`}
            <ChevronDownIcon className="size-4 text-muted-foreground opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="p-0"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandInput placeholder={`Select a ${name}`} className="h-9" />
            <CommandList>
              <CommandEmpty>No {name} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    value={option}
                    key={option}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    {option}
                    <CheckIcon
                      className={cn(
                        "ml-auto",
                        option === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationComboBox;
