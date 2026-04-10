"use client";

import React, { ReactNode, useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  href: string;
  className?: string;
}

export const SidebarItem = ({
  icon,
  label,
  href,
  className = "",
}: SidebarItemProps) => {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center transition-colors duration-200
        text-white font-semibold text-lg hover:bg-white/10
        ${collapsed ? "justify-center px-3 py-4" : "px-6 py-3"}
        ${isActive ? "text-blue-400 underline underline-offset-4" : ""} 
        ${className}
      `}
    >
      <span className={collapsed ? "" : "mr-3"}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};

interface SidebarSectionProps {
  children: ReactNode;
}

export const TopItems = ({ children }: SidebarSectionProps) => (
  <div className="flex flex-col pt-8 grow">{children}</div>
);

export const BottomItems = ({ children }: SidebarSectionProps) => (
  <div className="flex flex-col">{children}</div>
);

// Main Sidebar Component
interface CustomSidebarProps {
  variant?: "primary" | "secondary";
  className?: string;
  children: ReactNode;
  defaultCollapsed?: boolean; // optional initial state
}

export default function CustomSidebar({
  variant = "primary",
  className,
  children,
  defaultCollapsed = true,
}: CustomSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const variantClasses =
    variant === "primary" ? "bg-[#484677]" : "bg-[#ffffff]";

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapse }}>
      <aside
        className={`
          ${variantClasses} 
          ${className}
          ${collapsed ? "w-20" : "w-80"}
          ${variant === "primary" ? "h-screen flex flex-col transition-all duration-300" : "h-full flex flex-col transition-all duration-300"}
          ${variant === "secondary" ? "overflow-y-auto scrollbar-hide" : ""}
        `}
      >
        {children}

        {/* Toggle button for primary variant */}
        {variant === "primary" && (
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center p-4 text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        )}
      </aside>
    </SidebarContext.Provider>
  );
}
