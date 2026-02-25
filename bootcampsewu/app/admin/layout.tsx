"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SwitchAccountDialog } from "@/components/auth/switch-account-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  useEffect(() => {
    if (loading) return;

    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/auth/login");
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <SwitchAccountDialog
        open={isSwitchAccountOpen}
        onOpenChange={setIsSwitchAccountOpen}
      />
      <AppSidebar role="admin" />
      <div className="flex min-h-screen flex-1 flex-col bg-gray-100 dark:bg-gray-900">
        <header className="bg-background flex h-16 items-center justify-between gap-4 border-b px-6 shadow-sm">
          <div className="flex h-full w-full items-center gap-4">
            <SidebarTrigger />
            <div className="text-lg font-semibold">Mentor Area</div>
          </div>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user?.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSwitchAccountOpen(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Ganti Akun
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Daftar</Link>
              </Button>
            </>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
