import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { FaHome } from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";
import { CiSquarePlus } from "react-icons/ci";
import Link from "next/link";
import SidebarDropdown from "./SidebarDropdown";
import SidebarBranding from "./SidebarBranding";
import { getUser } from "@/utils/actions";
import { FaFileAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { Roles } from "@prisma/client";

const links = [
  {
    title: "Home",
    url: "/dashboard",
    icon: FaHome,
    visibleTo: ({ isTeacher }: { isTeacher: boolean }) => isTeacher,
  },
  {
    title: "Metrics",
    url: "/dashboard/metrics",
    icon: VscGraph,
    visibleTo: () => true,
  },
  {
    title: "Manage Locations",
    url: "/dashboard/manageLocations",
    icon: FaLocationDot,
    visibleTo: ({ role }: { role: Roles }) => role === "stanford",
  },
  {
    title: "Manage Forms",
    url: "/dashboard/manageForms",
    icon: FaFileAlt,
    visibleTo: ({ role }: { role: Roles }) => role === "stanford",
  },
  {
    title: "Add a Location",
    url: "/selectUserLocation",
    icon: CiSquarePlus,
    visibleTo: ({ role, isTeacher }: { role: Roles; isTeacher: boolean }) =>
      isTeacher && role !== "site",
  },
];

const AppSidebar = async () => {
  const { name, role, isTeacher } = await getUser();
  const headerLink = isTeacher ? "/dashboard" : "/dashboard/metrics";

  const filteredLinks = links.filter((link) =>
    link.visibleTo({ role, isTeacher })
  );

  let displayRole = role;
  if (displayRole !== Roles.teacher) {
    displayRole += " admin";

    if (isTeacher) {
      displayRole += " & teacher";
    }
  }

  return (
    <Sidebar collapsible="icon">
      <Link href={headerLink}>
        <SidebarHeader>
          <SidebarBranding />
        </SidebarHeader>
      </Link>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredLinks.map((link) => (
                <SidebarMenuItem key={link.title}>
                  <SidebarMenuButton asChild>
                    <Link href={link.url}>
                      <link.icon />
                      {link.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarDropdown name={name} role={displayRole} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
