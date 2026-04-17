import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import CustomSidebar, {
  BottomItems,
  SidebarItem,
  TopItems,
} from "@/src/components/CustomSidebar";
import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  NotepadText,
  Settings,
  User,
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
            icon={<NotepadText size={20} />}
          />
          <SidebarItem
            href="/recruiter/jobs"
            label="Jobs"
            icon={<BriefcaseBusiness size={20} />}
          />
          <SidebarItem
            href="/recruiter/interview"
            label="Interviews"
            icon={<MessagesSquare size={20} />}
          />
          <SidebarItem
            href="/recruiter/company"
            label="Company"
            icon={<Building2 size={20} />}
          />
          <SidebarItem
            href="/recruiter/profile"
            label="Profile"
            icon={<User size={20} />}
          />
          <SidebarItem
            href="/plans"
            label="Plans"
            icon={<CreditCard size={20} />}
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
      <div className="flex-1 max-h-screen overflow-y-auto">{children}</div>
    </div>
  );
}
