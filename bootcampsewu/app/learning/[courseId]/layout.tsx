"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import { enrollmentService } from "@/services/enrollment.service";
import { CourseSidebar } from "@/components/course-sidebar";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/learning/${courseId}`);
    }
  }, [isAuthLoading, isAuthenticated, router, courseId]);

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
  });

  const { data: enrollment, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => enrollmentService.checkEnrollment(courseId),
    enabled: !!courseId && isAuthenticated,
  });

  if (isCourseLoading || isEnrollmentLoading || isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!enrollment?.isEnrolled) {
    router.push(`/courses/${courseId}`); // Redirect to detail page if not enrolled
    return null;
  }

  if (!course) return null;

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-80 flex-col md:flex">
        <SidebarProvider defaultOpen={true}>
          <CourseSidebar
            role={(user?.role as "student" | "mentor" | "admin") || "student"}
            courseId={courseId}
          />
        </SidebarProvider>
      </aside>

      {/* Main Content */}
      <main className="w-full flex-1 overflow-y-auto">
        <div className="container max-w-4xl py-6 md:py-10">{children}</div>
      </main>
    </div>
  );
}
