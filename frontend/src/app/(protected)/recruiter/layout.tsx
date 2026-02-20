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
import { authOptions } from "../../api/auth/[...nextauth]/route";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/recruiter/login");
  }

  return (
    <div className="flex">
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
      <div className="w-[1664px]">{children}</div>
    </div>
  );
}
