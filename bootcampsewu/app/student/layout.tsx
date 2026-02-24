"use client"; // Should be at top.

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar role="student" />
      <div className="flex min-h-screen flex-1 flex-col bg-slate-50 dark:bg-slate-900/20">
        <header className="bg-background flex h-16 items-center gap-4 border-b px-6 shadow-sm">
          <SidebarTrigger />
          <div className="text-lg font-semibold">Student Dashboard</div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
