import {
  Award,
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ClipboardList,
  GraduationCap,
  Compass,
  BarChart3,
  Activity,
} from "lucide-react";

export type Role = "student" | "mentor" | "admin";

export interface SidebarItemConfig {
  label: string;
  href: (params?: any) => string;
  icon: any;
  type?: "link" | "certificate";
  requireCourseId?: boolean;
}

export const sidebarConfig: Record<Role, SidebarItemConfig[]> = {
  student: [
    {
      label: "Dashboard",
      href: () => "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Analytics",
      href: () => "/student/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: "Aktivitas",
      href: () => "/student/dashboard/activity",
      icon: Activity,
    },
    {
      label: "Sertifikat",
      href: () => "/student/dashboard/certificates",
      icon: GraduationCap,
    },
    {
      label: "Katalog Kursus",
      href: () => "/courses",
      icon: Compass,
    },
    {
      label: "Materi Kursus",
      href: (params) => `/learning/${params?.courseId}`,
      icon: BookOpen,
      requireCourseId: true,
    },
    {
      label: "Certificate",
      href: () => "#",
      icon: Award,
      type: "certificate",
      requireCourseId: true,
    },
  ],

  mentor: [
    {
      label: "Dashboard",
      href: () => "/mentor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Penilaian Project",
      href: () => "/mentor/submissions",
      icon: ClipboardList,
    },
    {
      label: "Kursus Saya",
      href: () => "/mentor/courses",
      icon: BookOpen,
    },
  ],

  admin: [
    {
      label: "Dashboard",
      href: () => "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Manajemen Kursus",
      href: () => "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "Pengguna",
      href: () => "/admin/users",
      icon: Users,
    },
    {
      label: "Sertifikat",
      href: () => "/admin/certificates",
      icon: GraduationCap,
    },
    {
      label: "Pengaturan",
      href: () => "/admin/settings",
      icon: Settings,
    },
  ],
};
