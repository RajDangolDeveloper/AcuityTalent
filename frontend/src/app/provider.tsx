"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ThemeProvider } from "./themeProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Provider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Do not refetch when window/tab gains focus — avoids showing
            // loading states on every tab switch. Initial page load still fetches.
            refetchOnWindowFocus: false,
            // Optional: avoid automatic refetch on reconnect as well
            refetchOnReconnect: false,
          },
        },
      }),
  );

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
