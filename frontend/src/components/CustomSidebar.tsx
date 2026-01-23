import React, { ReactNode } from "react";
import "./CustomSidebar.css";

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

interface SidebarSectionProps {
  children: ReactNode;
}

interface CustomSidebarProps {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

// 1. Individual Item Component
const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  onClick,
  active,
  className = "",
}) => (
  <div
    className={`sidebar-item ${active ? "active" : ""} ${className}`}
    onClick={onClick}
  >
    {icon && <span className="sidebar-icon">{icon}</span>}
    <span className="sidebar-label">{label}</span>
  </div>
);

// 2. Section Wrappers
const SidebarTop: React.FC<SidebarSectionProps> = ({ children }) => (
  <div className="sidebar-top">{children}</div>
);

const SidebarBottom: React.FC<SidebarSectionProps> = ({ children }) => (
  <div className="sidebar-bottom">{children}</div>
);

// 3. Main Sidebar Component
const CustomSidebar: React.FC<CustomSidebarProps> & {
  Item: typeof SidebarItem;
  Top: typeof SidebarTop;
  Bottom: typeof SidebarBottom;
} = ({ variant = "primary", children }) => {
  return (
    <aside
      className={`custom-sidebar h-screen ${variant} ${
        variant === "secondary" ? "overflow-y-auto scrollbar-none" : ""
      }`}
    >
      {children}
    </aside>
  );
};

// Attaching sub-components to the main object
CustomSidebar.Item = SidebarItem;
CustomSidebar.Top = SidebarTop;
CustomSidebar.Bottom = SidebarBottom;

export default CustomSidebar;
