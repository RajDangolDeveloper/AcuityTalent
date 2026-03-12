import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import CustomSidebar, {
  TopItems,
  SidebarItem,
  BottomItems,
} from "@/src/components/CustomSidebar";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  NotepadText,
  Settings,
  LogOut,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/recruiter/login");
  }

  if (!session.user.role.includes("ADMIN")) {
    redirect("/recruiter/login");
  }

  return (
    <div className="flex min-w-dvw">
      <CustomSidebar variant="primary">
        <TopItems>
          <SidebarItem
            href="/admin/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={20} />}
          />
          <SidebarItem
            href="/admin/users"
            label="Users"
            icon={<BriefcaseBusiness size={20} />}
          />
          <SidebarItem
            href="/admin/reports"
            label="Reports"
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
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
