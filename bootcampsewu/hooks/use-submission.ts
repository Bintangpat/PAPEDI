import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submissionService,
  GradeSubmissionData,
} from "@/services/submission.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ─── Query: list all mentor submissions ───────────────────────────────────────

export function useMentorSubmissions(status?: string) {
  return useQuery({
    queryKey: ["mentor-submissions", status],
    queryFn: () => submissionService.getMentorSubmissions(status),
  });
}

// ─── Query: single submission detail ──────────────────────────────────────────

export function useSubmissionDetail(id: string) {
  return useQuery({
    queryKey: ["mentor-submission-detail", id],
    queryFn: () => submissionService.getSubmissionById(id),
    enabled: !!id,
  });
}

// ─── Mutation: grade submission ───────────────────────────────────────────────

export function useGradeSubmission(submissionId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: GradeSubmissionData) =>
      submissionService.gradeSubmission(submissionId, data),
    onSuccess: () => {
      toast.success("Penilaian berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["mentor-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["mentor-submission-detail", submissionId],
      });
      router.push("/mentor/submissions");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || err.message || "Gagal menilai",
      );
    },
  });
}
