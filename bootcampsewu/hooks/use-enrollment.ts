import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollmentService } from "@/services/enrollment.service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Hook untuk cek status enrollment pada suatu course.
 * Hanya aktif jika user sudah login.
 */
export const useCheckEnrollment = (courseId: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => enrollmentService.checkEnrollment(courseId),
    enabled: isAuthenticated && !!courseId,
  });
};

/**
 * Hook untuk mendaftar ke suatu course.
 * Setelah sukses, redirect ke halaman learning.
 */
export const useEnrollCourse = (courseId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: () => enrollmentService.enroll(courseId),
    onSuccess: () => {
      toast.success("Berhasil mendaftar kursus! Selamat belajar.");
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      router.push(`/learning/${courseId}`);
    },
    onError: (error: any) => {
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }
      toast.error(error.response?.data?.message || "Gagal mendaftar kursus.");
    },
  });
};

/**
 * Hook untuk mengambil daftar enrollment milik user.
 */
export const useMyEnrollments = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentService.getMyEnrollments(),
    enabled: isAuthenticated,
  });
};

/**
 * Hook untuk menandai lesson sebagai selesai.
 */
export const useMarkLessonComplete = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) =>
      enrollmentService.markLessonComplete(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
    },
  });
};
