import AppSidebar from "@/components/sidebar/AppSidebar";
import Navbar from "@/components/navbar/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full max-w-7xl mx-auto">
        <Navbar />
        <div className="p-8">{children}</div>
      </div>
    </SidebarProvider>
  );
};

export default layout;
