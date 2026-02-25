"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Award, Loader2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

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

export function CourseSidebar({
  role,
  courseId,
  isCourseCompleted,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const items = sidebarConfig[role] || [];

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
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const href = item.href({ courseId });
                const isActive = pathname === href;

                // Certificate special handling
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
      </SidebarContent>

      <SidebarFooter>
        <div className="text-muted-foreground text-xs">Role: {role}</div>
      </SidebarFooter>
    </Sidebar>
  );
}
