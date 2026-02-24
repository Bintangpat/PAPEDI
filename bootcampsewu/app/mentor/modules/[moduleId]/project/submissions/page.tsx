"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { projectService, ProjectSubmission } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectSubmissionsPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const courseId = params.courseId as string;
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedSubmission, setSelectedSubmission] =
    useState<ProjectSubmission | null>(null);
  const [gradeStatus, setGradeStatus] = useState<"LULUS" | "REVISI">("LULUS");
  const [feedback, setFeedback] = useState("");
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);

  // 1. Fetch Project ID using Module ID
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", "module", moduleId],
    queryFn: () => projectService.getProjectByModuleId(moduleId),
    enabled: !!moduleId,
  });

  const projectId = project?.id;

  // 2. Fetch Submissions
  const { data: submissions, isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ["submissions", projectId],
    queryFn: () => projectService.getProjectSubmissions(projectId!),
    enabled: !!projectId,
  });

  const gradeMutation = useMutation({
    mutationFn: (data: { status: "LULUS" | "REVISI"; feedback: string }) =>
      projectService.gradeProject(selectedSubmission!.id, data),
    onSuccess: () => {
      toast.success("Submission berhasil dinilai");
      queryClient.invalidateQueries({ queryKey: ["submissions", projectId] });
      setIsGradeDialogOpen(false);
      setSelectedSubmission(null);
      setFeedback("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menilai submission");
    },
  });

  const handleGradeClick = (submission: ProjectSubmission) => {
    setSelectedSubmission(submission);
    setGradeStatus(
      submission.status === "PENDING"
        ? "LULUS"
        : (submission.status as "LULUS" | "REVISI"),
    );
    setFeedback(submission.feedback || "");
    setIsGradeDialogOpen(true);
  };

  const handleSubmitGrade = () => {
    if (!selectedSubmission) return;
    gradeMutation.mutate({ status: gradeStatus, feedback });
  };

  if (isProjectLoading || (projectId && isSubmissionsLoading)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-xl font-semibold">Project tidak ditemukan</h2>
        <p className="text-muted-foreground">
          Pastikan Anda telah membuat project definition untuk modul ini.
        </p>
        <Button
          className="mt-4"
          onClick={() => router.push(`/mentor/modules/${moduleId}/project`)}
        >
          Buat Project
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center gap-2">
        <Link
          href={`/mentor/courses/${courseId}/modules`}
          className="text-muted-foreground hover:text-primary flex items-center text-sm transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Modul
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Submissions: {project.title}</h1>
          <p className="text-muted-foreground">
            Kelola dan nilai tugas akhir siswa
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Submission ({submissions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!submissions || submissions.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              Belum ada submission.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Tanggal Submit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sub.student?.avatar} />
                          <AvatarFallback>
                            {sub.student?.name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {sub.student?.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {sub.student?.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(sub.submittedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "LULUS"
                            ? "default"
                            : sub.status === "REVISI"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          sub.status === "LULUS"
                            ? "bg-green-500 hover:bg-green-600"
                            : ""
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {sub.githubUrl && (
                          <a
                            href={sub.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="GitHub"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {sub.demoUrl && (
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Demo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGradeClick(sub)}
                      >
                        Nilai
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nilai Submission</DialogTitle>
            <DialogDescription>
              Berikan status kelulusan dan feedback untuk siswa.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                  value={gradeStatus}
                  onValueChange={(val: "LULUS" | "REVISI") =>
                    setGradeStatus(val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LULUS">LULUS</SelectItem>
                    <SelectItem value="REVISI">REVISI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Berikan masukan untuk siswa..."
                  rows={5}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGradeDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitGrade}
              disabled={gradeMutation.isPending}
            >
              {gradeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Penilaian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
