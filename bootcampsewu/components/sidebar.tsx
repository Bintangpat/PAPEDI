"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  Loader2,
  LogOut,
  User,
  ChevronsUpDown,
  Sparkles,
  Info,
  BookOpenCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
import { useSurvey } from "@/hooks/use-survey";
import { usePublicCourses } from "@/hooks/use-course";

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

  // Recommendations Logic
  const isStudent = role === "student";
  const { data: surveyRes, isLoading: isLoadingSurvey } = useSurvey();
  const hasSurvey = surveyRes?.hasSurvey;
  const recommendedCategory = surveyRes?.data?.recommendedCategory;

  const { data: recommendedCoursesData, isLoading: isLoadingCourses } =
    usePublicCourses({
      category: recommendedCategory || undefined,
      limit: 3,
      sort: "date_desc",
    });

  const recommendedCourses = recommendedCoursesData?.data || [];

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

        {/* ── Recommendations for Students ── */}
        {isStudent && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Rekomendasi</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {!isLoadingSurvey && !hasSurvey && (
                  <SidebarMenuItem>
                    <div className="mx-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                      <div className="mb-2 flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 text-blue-600" />
                        <p className="text-[11px] leading-tight font-medium text-blue-700 dark:text-blue-300">
                          Belum tau mau mulai dari mana?
                        </p>
                      </div>
                      <Link href="/survey">
                        <Button
                          size="sm"
                          className="h-7 w-full bg-blue-600 text-[10px] hover:bg-blue-700"
                        >
                          Ambil Survey Minat
                        </Button>
                      </Link>
                    </div>
                  </SidebarMenuItem>
                )}

                {hasSurvey && recommendedCourses.length > 0 && (
                  <>
                    {recommendedCourses.map((course) => {
                      // Check if course is "new" (created in last 7 days)
                      const isNew =
                        new Date().getTime() -
                          new Date(course.createdAt).getTime() <
                        7 * 24 * 60 * 60 * 1000;

                      return (
                        <SidebarMenuItem key={course.id}>
                          <SidebarMenuButton asChild tooltip={course.title}>
                            <Link
                              href={`/courses/${course.id}`}
                              className="flex items-center justify-between gap-2 overflow-hidden px-2"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <BookOpenCheck className="text-muted-foreground h-4 w-4 shrink-0" />
                                <span className="truncate text-xs font-normal">
                                  {course.title}
                                </span>
                              </div>
                              {isNew && (
                                <Badge className="h-4 shrink-0 border-none bg-emerald-500 px-1 py-0 text-[8px] hover:bg-emerald-500">
                                  Baru
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                    <SidebarMenuItem className="mt-1">
                      <Link
                        href="/courses"
                        className="text-muted-foreground hover:text-primary px-3 text-[10px] transition-colors"
                      >
                        Lihat semua katalog &rarr;
                      </Link>
                    </SidebarMenuItem>
                  </>
                )}

                {hasSurvey &&
                  recommendedCourses.length === 0 &&
                  !isLoadingCourses && (
                    <SidebarMenuItem>
                      <p className="text-muted-foreground px-3 text-[10px] leading-tight italic">
                        Belum ada pelatihan baru di kategori kamu.
                      </p>
                    </SidebarMenuItem>
                  )}
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
