"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Award, Loader2, LogOut, User, ChevronsUpDown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sidebarConfig, Role } from "@/config/sidebar.config";
import { certificateService } from "@/services/certificate.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AppSidebarProps {
  role: Role;
  courseId?: string;
  isCourseCompleted?: boolean;
}

export function AppSidebar({
  role,
  courseId,
  isCourseCompleted,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const items = sidebarConfig[role] || [];

  // Extract moduleId from URL if we're inside a module page
  // e.g. /mentor/modules/abc123/quiz → moduleId = "abc123"
  const moduleIdMatch = pathname.match(/\/mentor\/modules\/([^/]+)/);
  const moduleIdFromPath = moduleIdMatch?.[1];

  const handleClaimCertificate = async () => {
    if (!courseId) return;

    try {
      setIsGeneratingCert(true);
      const res = await certificateService.generateCertificate(courseId);
      if (res.success) {
        toast.success("Sertifikat berhasil dibuat!");
        router.push(`/certificates/${res.data.id}`);
      }
    } catch (error: any) {
      toast.error("Gagal membuat sertifikat.");
    } finally {
      setIsGeneratingCert(false);
    }
  };

  if (!items.length) return null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600">
            <Award className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">PAPEDI</span>
            <span className="truncate text-xs">Learning Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* ── Global Navigation ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((item) => !item.requireModuleId)
                .map((item) => {
                  if (item.requireCourseId && !courseId) return null;

                  const href = item.href({
                    courseId,
                    moduleId: moduleIdFromPath,
                  });
                  const isActive =
                    pathname === href || pathname.startsWith(href + "/");

                  if (item.type === "certificate") {
                    return (
                      <SidebarMenuItem key={item.label}>
                        <Button
                          variant={isCourseCompleted ? "default" : "secondary"}
                          disabled={!isCourseCompleted || isGeneratingCert}
                          onClick={handleClaimCertificate}
                          className="w-full justify-start gap-2"
                        >
                          {isGeneratingCert ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Award className="h-4 w-4" />
                          )}
                          {isCourseCompleted
                            ? "Klaim Sertifikat"
                            : "Selesaikan Kursus"}
                        </Button>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Module-Context Navigation (only visible inside a module page) ── */}
        {moduleIdFromPath && (
          <SidebarGroup>
            <SidebarGroupLabel>Modul Aktif</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter((item) => item.requireModuleId)
                  .map((item) => {
                    const href = item.href({
                      courseId,
                      moduleId: moduleIdFromPath,
                    });
                    const isActive =
                      pathname === href || pathname.startsWith(href + "/");

                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem></SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="text-muted-foreground text-xs transition-opacity group-data-[collapsible=icon]:opacity-0">
                Theme
              </div>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
