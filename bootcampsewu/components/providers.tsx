"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { SurveyModal } from "@/components/survey/SurveyModal";
import { useState } from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <SurveyModal />
          <Toaster />
        </AuthProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
