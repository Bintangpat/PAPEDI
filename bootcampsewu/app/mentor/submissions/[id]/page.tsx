"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function GradeSubmissionPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [grade, setGrade] = useState<string>("LULUS");
  const [feedback, setFeedback] = useState<string>("");

  // Fetch specific submission details if needed,
  // currently fetching generic list and filtering or better fetch detail endpoint
  // For now, let's reuse the logic or create a specific endpoint if strictly needed.
  // Ideally, Backend should have GET /mentor/submissions/:id
  // But strictly strictly we can reuse list or create new.
  // Let's assume we can fetch list and find, OR add Detail Endpoint.
  // Plan: Add GET /api/v1/mentor/submissions/:id to Controller?
  // Or just Filter client side from list if cached?
  // Use Client side filter for speed if list is small, but better fetch fresh.
  // Let's TRY to fetch the same 'my' endpoint but for specific ID? No.
  // I will add a `getSubmissionById` to controller or just blindly call it since GET /submissions returns list.
  // Wait, I implemented `getSubmissions` list.
  // Let's implement a quick client-side fetch for now using existing, or better yet, assume I add getById.
  // Actually, I'll just browse the list because I didn't add getById in plan.
  // Refactoring plan: I will add `getSubmissionById` to backend now.

  const { data: submission, isLoading } = useQuery({
    queryKey: ["mentor-submission-detail", id],
    queryFn: async () => {
      // HACK: Fetch all and find (Not ideal for production but works for Sprint)
      // OR better: Create the endpoint.
      // Let's try to just fetch the list and find it.
      const res = await api.get("/mentor/submissions");
      return res.data.data.find((s: any) => s.id === id);
    },
    enabled: !!id,
  });

  const gradeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/mentor/submissions/${id}/grade`, {
        status: grade,
        feedback,
      });
    },
    onSuccess: () => {
      toast.success("Penilaian berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["mentor-submissions"] });
      router.push("/mentor/submissions");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menilai");
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!submission) return <div>Submission not found</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/mentor/submissions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Penilaian Project</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Submission Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Siswa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Nama Siswa</Label>
                <p className="font-medium">{submission.student.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Kursus</Label>
                <p className="font-medium">{submission.course.title}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengerjaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">
                  GitHub Repository
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <a
                    href={submission.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-blue-600 hover:underline"
                  >
                    {submission.githubUrl}
                  </a>
                  <ExternalLink className="text-muted-foreground h-4 w-4" />
                </div>
              </div>
              {submission.demoUrl && (
                <div>
                  <Label className="text-muted-foreground">Live Demo</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href={submission.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-blue-600 hover:underline"
                    >
                      {submission.demoUrl}
                    </a>
                    <ExternalLink className="text-muted-foreground h-4 w-4" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grading Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Penilaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status Kelulusan</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LULUS">LULUS</SelectItem>
                    <SelectItem value="REVISI">REVISI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Feedback Mentor</Label>
                <Textarea
                  placeholder="Berikan masukan kepada siswa..."
                  className="min-h-[150px]"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => gradeMutation.mutate()}
                  disabled={gradeMutation.isPending || !feedback}
                >
                  {gradeMutation.isPending ? "Menyimpan..." : "Kirim Penilaian"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
