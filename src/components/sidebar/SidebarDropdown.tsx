import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RiLogoutBoxLine, RiExpandUpDownLine } from "react-icons/ri";
import { IoIosSettings } from "react-icons/io";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const SidebarDropdown = ({ name, role }: { name: string; role: string }) => {
  const names = name.split(" ");
  const initials =
    names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center focus:outline-none overflow-hidden justify-between">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback className="bg-primary text-secondary uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="justify-items-start ml-4 whitespace-nowrap">
            <h4 className="font-semibold capitalize">{name}</h4>
            <p className="text-sm capitalize">{role}</p>
          </div>
        </div>
        <RiExpandUpDownLine className="text-xl" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="mb-2">
        <Link href="/dashboard/settings">
          <DropdownMenuItem>
            <IoIosSettings />
            Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem>
          <RiLogoutBoxLine />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarDropdown;
