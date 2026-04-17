import {
  BriefcaseBusiness,
  Building2,
  Brain,
  FileText,
  LayoutDashboard,
  ShieldUser,
  UserCircle2,
  Users2,
  UserSquare2,
  CalendarCheck2,
  Bookmark,
} from "lucide-react";

export type AdminFeatureKey =
  | "users"
  | "candidates"
  | "recruiters"
  | "companies"
  | "jobs"
  | "applications"
  | "interviews"
  | "resumes"
  | "saved-jobs";

export const ADMIN_FEATURES: Array<{
  key: AdminFeatureKey;
  label: string;
  description: string;
  href: string;
  icon: any;
}> = [
  {
    key: "users",
    label: "Users",
    description: "All registered users with role and profile links",
    href: "/admin/users",
    icon: Users2,
  },
  {
    key: "candidates",
    label: "Candidates",
    description: "Candidate profiles, applications, resumes and skills",
    href: "/admin/candidates",
    icon: UserCircle2,
  },
  {
    key: "recruiters",
    label: "Recruiters",
    description: "Recruiter profiles and recruiter-owned activity",
    href: "/admin/recruiters",
    icon: UserSquare2,
  },
  {
    key: "companies",
    label: "Companies",
    description: "Organization data, recruiters and posted jobs",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    key: "jobs",
    label: "Jobs",
    description: "Job postings, saved counts and applications",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    key: "applications",
    label: "Applications",
    description: "Applications across all candidates and recruiters",
    href: "/admin/applications",
    icon: FileText,
  },
  {
    key: "interviews",
    label: "Interviews",
    description: "Interview schedules, participants and statuses",
    href: "/admin/interviews",
    icon: CalendarCheck2,
  },
  {
    key: "resumes",
    label: "Resumes",
    description: "Uploaded resume files and related scoring data",
    href: "/admin/resumes",
    icon: ShieldUser,
  },
  {
    key: "saved-jobs",
    label: "Saved Jobs",
    description: "Saved jobs across all candidates",
    href: "/admin/saved-jobs",
    icon: Bookmark,
  },
];

export const ADMIN_STATIC_NAV = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/ai/embeddings",
    label: "AI Embeddings",
    icon: Brain,
  },
];

export const ADMIN_FEATURE_WITH_DETAIL = new Set<AdminFeatureKey>([
  "users",
  "candidates",
  "recruiters",
  "companies",
  "jobs",
  "applications",
  "interviews",
  "resumes",
  "saved-jobs",
]);

export const getAdminFeatureByKey = (key: string) =>
  ADMIN_FEATURES.find((feature) => feature.key === key);
