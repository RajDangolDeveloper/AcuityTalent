import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
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
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex ">
      {session?.user?.role === "Candidate" ? (
        <CustomSidebar variant="primary">
          <TopItems>
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
        </CustomSidebar>
      ) : session?.user?.role === "Recruiter" ? (
        <CustomSidebar variant="primary">
          <TopItems>
            <SidebarItem
              href="/recruiter/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard size={20} />}
            />
            <SidebarItem
              href="/recruiter/jobs/candidates"
              label="Candidates"
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
      ) : (
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
      )}
      <div>{children}</div>
    </div>
  );
}
