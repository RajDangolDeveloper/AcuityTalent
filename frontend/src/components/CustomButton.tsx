import { ReactNode } from "react";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: "primary" | "secondary" | "white";
  children: ReactNode;
}

export default function CustomButton({
  children,
  color,
  className,
  ...props
}: CustomButtonProps) {
  const colorVariants: Record<
    NonNullable<CustomButtonProps["color"]>,
    string
  > = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white",
    secondary: "bg-secondary-500 hover:bg-secondary-600 text-white",
    white: "bg-gray-100 hover:bg-gray-300 text-primary",
  };
  return (
    <button
    {...props}
      className={`${colorVariants[color]} ${className} w-full font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out`}
    >
      {children}
    </button>
  );
}
