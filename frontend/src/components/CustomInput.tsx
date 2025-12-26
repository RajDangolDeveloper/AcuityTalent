import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function CustomInput({
  leftIcon,
  rightIcon,
  className = "",
  type = "text",
  ...props
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="relative w-full group text-gray-400 focus-within:text-primary-900">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors">
          {leftIcon}
        </div>
      )}

      <input
        {...props}
        type={inputType}
        className={`
          border border-gray-600 p-2 w-sm rounded-md bg-transparent
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all
          ${leftIcon ? "pl-10" : "pl-3"} 
          ${rightIcon ? "pr-10" : "pr-3"}
          ${className}
        `}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {rightIcon && <span>{rightIcon}</span>}
      </div>
    </div>
  );
}
