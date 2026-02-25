"use client";

import { useState } from "react";
import { Certificate } from "@/types/course";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldX, Award, Copy } from "lucide-react";
import {
  useAdminCertificates,
  useAdminRevokeCertificate,
} from "@/hooks/use-certificate";
import { toast } from "sonner";

function StatusBadge({ status }: { status?: string }) {
  if (status === "REVOKED")
    return (
      <Badge className="bg-red-500 text-white hover:bg-red-600">Direvoke</Badge>
    );
  return (
    <Badge className="bg-green-500 text-white hover:bg-green-600">Terbit</Badge>
  );
}

function GradeBadge({ grade }: { grade?: string | null }) {
  const colors: Record<string, string> = {
    A: "bg-emerald-500",
    B: "bg-blue-500",
    C: "bg-yellow-500",
    D: "bg-orange-500",
    E: "bg-red-500",
  };
  if (!grade) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <Badge className={`${colors[grade] || "bg-gray-400"} text-white`}>
      {grade}
    </Badge>
  );
}

function RevokeDialog({
  certificate,
  courseId,
}: {
  certificate: Certificate;
  courseId: string;
}) {
  const [open, setOpen] = useState(false);
  const revoke = useAdminRevokeCertificate(courseId);

  const handleRevoke = async () => {
    try {
      await revoke.mutateAsync(certificate.id);
      toast.success(
        `Sertifikat ${certificate.user?.name ?? ""} berhasil direvoke.`,
      );
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal merevoke sertifikat.");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:bg-red-50 hover:text-red-700"
        disabled={certificate.status === "REVOKED"}
        onClick={() => setOpen(true)}
      >
        <ShieldX className="mr-1 h-4 w-4" />
        Revoke
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Sertifikat?</DialogTitle>
            <DialogDescription>
              Sertifikat atas nama <strong>{certificate.user?.name}</strong> (
              {certificate.serialNumber}) akan direvoke dan tidak berlaku lagi.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleRevoke}
              disabled={revoke.isPending}
            >
              {revoke.isPending ? "Memproses..." : "Ya, Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function CertificateList({ courseId }: { courseId: string }) {
  const {
    data: certificates,
    isLoading,
    isError,
  } = useAdminCertificates(courseId);

  const copySerial = (serial: string) => {
    navigator.clipboard.writeText(serial);
    toast.success("Serial number disalin!");
  };

  if (isError) {
    return (
      <div className="flex h-32 items-center justify-center text-red-500">
        Gagal memuat daftar sertifikat.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Peserta</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="text-center">Nilai Akhir</TableHead>
            <TableHead>Tanggal Terbit</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !certificates || certificates.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground h-32 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <Award className="h-8 w-8 opacity-30" />
                  <span>Belum ada sertifikat yang diterbitkan.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            certificates.map((cert: Certificate) => (
              <TableRow key={cert.id}>
                <TableCell>
                  <div className="font-medium">{cert.user?.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {cert.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => copySerial(cert.serialNumber)}
                    className="flex items-center gap-1 font-mono text-xs transition-colors hover:text-blue-600"
                    title="Salin serial number"
                  >
                    {cert.serialNumber}
                    <Copy className="h-3 w-3 opacity-50" />
                  </button>
                </TableCell>
                <TableCell className="text-center">
                  <GradeBadge grade={cert.grade} />
                </TableCell>
                <TableCell className="text-center">
                  {cert.finalScore != null
                    ? `${cert.finalScore.toFixed(1)}`
                    : "—"}
                </TableCell>
                <TableCell>
                  {new Date(cert.issuedAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={cert.status} />
                </TableCell>
                <TableCell className="text-right">
                  <RevokeDialog certificate={cert} courseId={courseId} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
