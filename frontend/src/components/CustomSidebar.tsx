"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  href: string;
  className?: string;
}

interface SidebarSectionProps {
  children: ReactNode;
}

interface CustomSidebarProps {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export const SidebarItem = ({
  icon,
  label,
  href,
  className = "",
}: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center px-6 py-3 transition-colors duration-200
        text-white font-semibold text-lg hover:bg-white/10
        ${isActive ? "text-blue-400 underline underline-offset-4" : ""} 
        ${className}
      `}
    >
      {icon && <span className="mr-3">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};

export const TopItems = ({ children }: SidebarSectionProps) => (
  <div className="flex flex-col pt-8 flex-grow">{children}</div>
);

export const BottomItems = ({ children }: SidebarSectionProps) => (
  <div className="flex flex-col pb-8">{children}</div>
);

export default function CustomSidebar({
  variant = "primary",
  children,
}: CustomSidebarProps) {
  // Map variants to specific purple shades from your image
  const variantClasses =
    variant === "primary" ? "bg-[#484677]" : "bg-[#ffffff]";

  return (
    <aside
      className={`
        ${variantClasses} 
        h-screen w-64 flex flex-col 
        ${variant === "secondary" ? "overflow-y-auto scrollbar-hide" : ""}
      `}
    >
      {children}
    </aside>
  );
}
