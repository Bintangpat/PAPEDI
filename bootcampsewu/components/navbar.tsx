"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SwitchAccountDialog } from "@/components/auth/switch-account-dialog";
import { useState } from "react";
import { Users } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);

  return (
    <>
      <SwitchAccountDialog
        open={isSwitchAccountOpen}
        onOpenChange={setIsSwitchAccountOpen}
      />
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex w-full items-center-safe justify-center-safe justify-items-center border-b backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">PAPEDI</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/courses"
              className="hover:text-foreground/80 text-foreground/60 transition-colors"
            >
              Katalog Kursus
            </Link>
            <Link
              href="/about"
              className="hover:text-foreground/80 text-foreground/60 transition-colors"
            >
              Tentang Kami
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
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
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Dashboard Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Riwayat Belajar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsSwitchAccountOpen(true)}
                  >
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
          </div>
        </div>
      </header>
    </>
  );
}
