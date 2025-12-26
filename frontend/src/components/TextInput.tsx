import React, { ReactNode } from "react";

interface ButtonProps {
  children?: ReactNode;
  className?: string;
}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`bg-primary-500 ${className}`} {...props}>
      {children}
    </button>
  );
}
