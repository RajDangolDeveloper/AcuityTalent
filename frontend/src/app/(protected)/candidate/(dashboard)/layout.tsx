import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import CustomSidebar, {
  BottomItems,
  SidebarItem,
  TopItems,
} from "@/src/components/CustomSidebar";
import {
  BriefcaseBusiness,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  NotebookPen,
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
          <SidebarItem
            href="/candidate/applications"
            label="Applications"
            icon={<NotebookPen size={20} />}
          />
          <SidebarItem
            href="/candidate/interviews"
            label="Interviews"
            icon={<MessagesSquare size={20} />}
          />
          <SidebarItem
            href="/candidate/profile"
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
        </BottomItems>
        <SidebarItem
          href="/logout"
          label="Log out"
          icon={<LogOut size={20} />}
        />
      </CustomSidebar>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
