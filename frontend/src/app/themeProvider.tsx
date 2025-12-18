"use client";

import { useState, useEffect, ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState({ theme: "light", mounted: false });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    requestAnimationFrame(() => {
      setConfig({
        theme: savedTheme,
        mounted: true,
      });
    });
  }, []);

  if (!config.mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <div data-theme={config.theme}>
      {children}
    </div>
  );
}