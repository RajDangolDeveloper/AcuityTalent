import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import CustomSidebar, {
  BottomItems,
  SidebarItem,
  TopItems,
} from "@/src/components/CustomSidebar";
import {
  BriefcaseBusiness,
  Home,
  LayoutDashboard,
  LogOut,
  NotepadText,
  Settings,
} from "lucide-react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <CustomSidebar variant="primary">
        <TopItems>
          <SidebarItem href="/" label="Home" icon={<Home size={20} />} />
          <SidebarItem
            href="/candidate/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={20} />}
          />
          <SidebarItem
            href="/candidate/jobs"
            label="Jobs"
            icon={<BriefcaseBusiness size={20} />}
          />
          <SidebarItem
            href="/candidate/resumes"
            label="Resumes"
            icon={<NotepadText size={20} />}
          />
        </TopItems>

        <BottomItems>
          <SidebarItem
            href="/settings"
            label="Settings"
            icon={<Settings size={20} />}
          />
        </BottomItems>
        <SidebarItem
          href="/logout"
          label="Log out"
          icon={<LogOut size={20} />}
        />
      </CustomSidebar>
      <div className="w-[1664px]">{children}</div>
    </div>
  );
}
