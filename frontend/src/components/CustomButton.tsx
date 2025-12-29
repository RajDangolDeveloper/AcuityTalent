import { ReactNode } from "react";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: "primary" | "white";
  children: ReactNode;
}

export default function CustomButton({
  children,
  color,
  className,
}: CustomButtonProps) {
  const colorVariants: Record<
    NonNullable<CustomButtonProps["color"]>,
    string
  > = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white",
    white: "bg-gray-100 hover:bg-gray-300 text-primary",
  };
  return (
    <button
      className={`${colorVariants[color]} ${className} font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out`}
    >
      {children}
    </button>
  );
}
