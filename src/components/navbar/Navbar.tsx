import { SidebarTrigger } from "@/components/ui/sidebar";
import DarkMode from "./DarkMode";

const Navbar = () => {
  return (
    <nav className="flex border-b bg-[hsl(var(--sidebar-background))]">
      <div className="px-2 py-2 flex w-full items-center justify-between">
        <SidebarTrigger />
        <DarkMode />
      </div>
    </nav>
  );
};

export default Navbar;
