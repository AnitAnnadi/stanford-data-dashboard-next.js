import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { IoIosSettings } from "react-icons/io";
import Link from "next/link";
import DarkMode from "./DarkMode";

const Navbar = () => {
  return (
    <nav className="flex border-b bg-[hsl(var(--sidebar-background))]">
      <div className="px-2 py-2 flex w-full items-center justify-between">
        <SidebarTrigger />
        <div className="flex gap-x-2">
          <DarkMode />
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings">
              <IoIosSettings />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
