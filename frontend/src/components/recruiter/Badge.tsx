"use client";

import React from "react";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-block px-3 py-1 rounded-full text-xs font-semibold";

  const variantStyles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
