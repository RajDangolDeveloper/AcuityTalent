"use client"; // Required for hooks in Next.js

import Link from "next/link";
import { usePathname } from "next/navigation";

export const HomeNavigationBar = () => {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Jobs", href: "/jobs" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="flex justify-between px-8 pt-4">
      <div className="w-8 h-8">
        <img src="/logo/logo-small.png" alt="Logo" />
      </div>
      <ul className="flex gap-4 py-6">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.href} className="px-6">
              <Link
                href={link.href}
                className={`text-xl text-gray-200 underline-offset-8 decoration-2 ${
                  isActive ? "underline text-white" : "hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
