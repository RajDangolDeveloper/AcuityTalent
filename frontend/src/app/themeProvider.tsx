// Example: A Client Component Theme Provider
"use client";
import { useState, useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactElement }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  return (
    <div data-theme={theme} style={{ colorScheme: theme }}>
      {!mounted ? <div>Loading...</div> : children}
    </div>
  );
}
