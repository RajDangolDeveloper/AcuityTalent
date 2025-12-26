import { ReactNode } from "react";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children : ReactNode
}

export default function CustomButton({
children
}: CustomButtonProps) {
  return (
    <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out">{children}</button>
  );
}
