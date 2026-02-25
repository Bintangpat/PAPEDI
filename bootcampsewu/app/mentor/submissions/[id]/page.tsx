"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  useSubmissionDetail,
  useGradeSubmission,
} from "@/hooks/use-submission";

export default function GradeSubmissionPage() {
  const { id } = useParams();
  const submissionId = id as string;

  const { data: submission, isLoading } = useSubmissionDetail(submissionId);
  const gradeMutation = useGradeSubmission(submissionId);

  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<"REVISI" | "LULUS" | "">("");

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return <div className="py-20 text-center">Submission tidak ditemukan</div>;
  }

  const passingScore = submission.project?.passingScore ?? 80;
  const isScoreValid = score !== "" && score >= 0 && score <= 100;
  const wouldPass = isScoreValid && Number(score) >= passingScore;

  const isFormValid = !!status && !!feedback.trim() && isScoreValid;

  const handleSubmit = () => {
    if (!status) {
      toast.error("Status penilaian wajib dipilih");
      return;
    }
    if (!feedback.trim()) {
      toast.error("Feedback wajib diisi");
      return;
    }

    gradeMutation.mutate({
      status,
      feedback: feedback.trim(),
      score: score !== "" ? Number(score) : null,
    });
  };

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
              <div>
                <Label className="text-muted-foreground">Passing Score</Label>
                <p className="font-medium">{passingScore}</p>
              </div>
              {submission.score !== null && submission.score !== undefined && (
                <div>
                  <Label className="text-muted-foreground">
                    Skor Sebelumnya
                  </Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{submission.score}</p>
                    <Badge
                      variant={submission.isPassed ? "default" : "destructive"}
                    >
                      {submission.isPassed ? "Lulus" : "Belum Lulus"}
                    </Badge>
                  </div>
                </div>
              )}
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
              {/* Status Selection — THIS WAS MISSING and caused the bug */}
              <div className="space-y-2">
                <Label htmlFor="status">Status Penilaian *</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as "REVISI" | "LULUS")}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status penilaian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LULUS">✅ Lulus</SelectItem>
                    <SelectItem value="REVISI">🔄 Revisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Skor (0 - 100)</Label>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Masukkan skor (contoh: 85)"
                  value={score}
                  onChange={(e) => {
                    const val = e.target.value;
                    setScore(val === "" ? "" : Number(val));
                  }}
                />
                {isScoreValid && (
                  <p
                    className={`text-sm font-medium ${wouldPass ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {wouldPass
                      ? `✓ Lulus (≥ ${passingScore})`
                      : `✗ Belum Lulus (< ${passingScore})`}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback Mentor *</Label>
                <Textarea
                  id="feedback"
                  placeholder="Berikan masukan kepada siswa..."
                  className="min-h-[150px]"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={gradeMutation.isPending || !isFormValid}
                >
                  {gradeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Kirim Penilaian"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
