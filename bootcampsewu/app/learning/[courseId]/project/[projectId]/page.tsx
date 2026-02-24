"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { projectService, SubmitProjectData } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ProjectPage() {
  const params = useParams();
  const projectId = (params.projectId as string) || (params.lessonId as string); // Check mapping
  const courseId = params.courseId as string;

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubmitProjectData>({
    defaultValues: {
      courseId,
      projectId,
    },
  });

  // Fetch Project Details
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
  });

  // Fetch My Submission
  const { data: submission, isLoading: isSubmissionLoading } = useQuery({
    queryKey: ["submission", courseId, projectId],
    queryFn: () => projectService.getMySubmission(courseId, projectId),
    enabled: !!courseId && !!projectId,
  });

  const submitMutation = useMutation({
    mutationFn: (data: SubmitProjectData) => projectService.submitProject(data),
    onSuccess: () => {
      toast.success("Project berhasil disubmit!");
      queryClient.invalidateQueries({
        queryKey: ["submission", courseId, projectId],
      });
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal submit project");
    },
  });

  const onSubmit = (data: SubmitProjectData) => {
    submitMutation.mutate({
      ...data,
      courseId,
      projectId,
    });
  };

  if (isProjectLoading || isSubmissionLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="text-destructive h-12 w-12" />
        <h2 className="text-xl font-semibold">Project tidak ditemukan</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/learning/${courseId}`}
          className="text-muted-foreground hover:text-primary flex items-center text-sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Materi
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{project.title}</h1>
            <p
              className="text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: project.description.replace(/\n/g, "<br/>"),
              }}
            />
            {/* Assuming plain text or basic HTML from editor */}
          </div>

          {project.deadline && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              Deadline:{" "}
              {new Date(project.deadline).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Status Submission</CardTitle>
              <CardDescription>Upload tugas akhir Anda disini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge
                      variant={
                        submission.status === "LULUS"
                          ? "default" // green handled by global theme or specific class
                          : submission.status === "REVISI"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        submission.status === "LULUS"
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {submission.status}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground text-sm">
                    Disubmit pada: <br />
                    {new Date(submission.submittedAt).toLocaleString("id-ID")}
                  </div>

                  {submission.feedback && (
                    <div className="rounded border bg-slate-50 p-3 text-sm">
                      <div className="mb-1 font-medium">Feedback Mentor:</div>
                      {submission.feedback}
                    </div>
                  )}

                  <div className="space-y-2 border-t pt-2">
                    {submission.githubUrl && (
                      <a
                        href={submission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Repository GitHub
                      </a>
                    )}
                    {submission.demoUrl && (
                      <a
                        href={submission.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Live Demo
                      </a>
                    )}
                  </div>

                  {submission.status !== "LULUS" && (
                    <div className="pt-4">
                      <p className="text-muted-foreground mb-4 text-xs">
                        Ingin mengupdate submission?
                      </p>
                      {/* Allow resubmission form below or toggle */}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground py-4 text-center text-sm">
                  Belum ada submission.
                </div>
              )}

              {(!submission || submission.status !== "LULUS") && (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 border-t pt-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub Repository URL *</Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username/project"
                      {...register("githubUrl", {
                        required: "GitHub URL wajib diisi",
                      })}
                    />
                    {errors.githubUrl && (
                      <p className="text-xs text-red-500">
                        {errors.githubUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">Live Demo URL (Opsional)</Label>
                    <Input
                      id="demoUrl"
                      placeholder="https://my-project.vercel.app"
                      {...register("demoUrl")}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Mengirim...
                      </>
                    ) : submission ? (
                      "Resubmit Project"
                    ) : (
                      "Submit Project"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="justify-center">
              {submission?.status === "LULUS" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Selamat! Project Anda Lulus.
                  </span>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
