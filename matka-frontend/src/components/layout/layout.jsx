import React, { useState } from "react";
import SidebarMenu from "./SidebarMenu";
import { Outlet } from "react-router-dom";
import BottomNavBar from "./BottomNavBar";
import AppHeader from "./AppHeader";

export default function Layout() {
  const [sidebar, setSidebar] = useState(false);
  return (
    <div className="min-h-screen bg-white overflow-y-auto relative">
      <AppHeader setSidebar={setSidebar} />
      <main className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>
      <BottomNavBar />
      <SidebarMenu sidebar={sidebar} setSidebar={setSidebar} />
    </div>
  );
}
