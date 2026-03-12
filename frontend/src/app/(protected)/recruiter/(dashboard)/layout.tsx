import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import CustomSidebar, {
  BottomItems,
  SidebarItem,
  TopItems,
} from "@/src/components/CustomSidebar";
import {
  BriefcaseBusiness,
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
    <div className="flex min-w-dvw">
      <CustomSidebar variant="primary">
        <TopItems>
          <SidebarItem
            href="/recruiter/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={20} />}
          />
          <SidebarItem
            href="/recruiter/jobs/applications"
            label="Applications"
            icon={<BriefcaseBusiness size={20} />}
          />
          <SidebarItem
            href="/recruiter/jobs"
            label="Jobs"
            icon={<NotepadText size={20} />}
          />
          <SidebarItem
            href="/recruiter/interview"
            label="Interviews"
            icon={<NotepadText size={20} />}
          />
        </TopItems>

        <BottomItems>
          <SidebarItem
            href="/settings"
            label="Settings"
            icon={<Settings size={20} />}
          />
          <SidebarItem
            href="/logout"
            label="Log out"
            icon={<LogOut size={20} />}
          />
        </BottomItems>
      </CustomSidebar>
      <div className="flex-1">{children}</div>
    </div>
  );
}
