"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./themeProvider";
import { ToastContainer } from "react-toastify";
import { queryClient } from "@/library/queryClient";

export default function Provider({
  children,
}: {
  children: React.ReactElement;
}) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
