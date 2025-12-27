"use client";

import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLogin = pathname.includes("/login");

  return (
    <div
      className={`flex min-h-screen ${
        isLogin ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="hidden lg:flex w-3/4 bg-primary-700 items-center justify-center p-12">
        <div className="relative w-full aspect-square max-w-xl rounded-2xl overflow-hidden border border-white/10">
          <img
            src="/stock-images/auth-image.png"
            alt="Office working"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      <div className="w-full min-h-full lg:w-1/2 flex flex-col justify-center bg-white p-8">
        <div className="w-full h-full py-8">{children}</div>
      </div>
    </div>
  );
}
