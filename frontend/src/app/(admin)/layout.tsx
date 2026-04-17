import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import CustomSidebar, {
  TopItems,
  SidebarItem,
  BottomItems,
} from "@/src/components/CustomSidebar";
import {
  Bookmark,
  LayoutDashboard,
  Users2,
  UserCircle2,
  UserSquare2,
  Building2,
  BriefcaseBusiness,
  FileText,
  CalendarCheck2,
  ShieldUser,
  Brain,
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

  if (session.user.role !== "ADMIN") {
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
            icon={<Users2 size={20} />}
          />
          <SidebarItem
            href="/admin/candidates"
            label="Candidates"
            icon={<UserCircle2 size={20} />}
          />
          <SidebarItem
            href="/admin/recruiters"
            label="Recruiters"
            icon={<UserSquare2 size={20} />}
          />
          <SidebarItem
            href="/admin/companies"
            label="Companies"
            icon={<Building2 size={20} />}
          />
          <SidebarItem
            href="/admin/jobs"
            label="Jobs"
            icon={<BriefcaseBusiness size={20} />}
          />
          <SidebarItem
            href="/admin/applications"
            label="Applications"
            icon={<FileText size={20} />}
          />
          <SidebarItem
            href="/admin/interviews"
            label="Interviews"
            icon={<CalendarCheck2 size={20} />}
          />
          <SidebarItem
            href="/admin/resumes"
            label="Resumes"
            icon={<ShieldUser size={20} />}
          />
          <SidebarItem
            href="/admin/saved-jobs"
            label="Saved Jobs"
            icon={<Bookmark size={20} />}
          />
          <SidebarItem
            href="/admin/ai/embeddings"
            label="AI Embeddings"
            icon={<Brain size={20} />}
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
