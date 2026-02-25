"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { certificateService } from "@/services/certificate.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Printer, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { TextBlock } from "@/types/course";

// ========================
// Helpers
// ========================

function getGradeColor(grade?: string | null) {
  switch (grade) {
    case "A":
      return "text-emerald-600";
    case "B":
      return "text-blue-600";
    case "C":
      return "text-amber-600";
    case "D":
      return "text-orange-600";
    case "E":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
}

/** Replace template variables with actual certificate data */
function resolveVariable(
  variable: string,
  data: {
    studentName: string;
    courseName: string;
    serialNumber: string;
    issuedDate: string;
    grade: string;
    finalScore: string;
    instructorName: string;
    verificationToken: string;
  },
): string {
  const map: Record<string, string> = {
    "{{studentName}}": data.studentName,
    "{{courseName}}": data.courseName,
    "{{serialNumber}}": data.serialNumber,
    "{{issuedDate}}": data.issuedDate,
    "{{grade}}": data.grade,
    "{{finalScore}}": data.finalScore,
    "{{instructorName}}": data.instructorName,
    "{{verificationToken}}": data.verificationToken,
  };
  return map[variable] || variable;
}

// ========================
// Template-based Renderer
// ========================

function TemplateCertificate({
  certificate,
  bgImageUrl,
  textBlocks,
}: {
  certificate: any;
  bgImageUrl: string;
  textBlocks: TextBlock[];
}) {
  const templateData = {
    studentName: certificate.user?.name || "Nama Peserta",
    courseName: certificate.course?.title || "Nama Kursus",
    serialNumber: certificate.serialNumber || "",
    issuedDate: new Date(certificate.issuedAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    grade: certificate.grade || "-",
    finalScore:
      certificate.finalScore != null ? certificate.finalScore.toFixed(1) : "-",
    instructorName: certificate.instructorName || "Instruktur",
    verificationToken: certificate.verificationToken || "",
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-white shadow-xl print:shadow-none"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgImageUrl}
        alt="Certificate Background"
        className="absolute inset-0 h-full w-full object-cover"
        crossOrigin="anonymous"
      />

      {/* Text Blocks */}
      {textBlocks.map((block) => {
        const displayText = resolveVariable(block.variable, templateData);
        return (
          <div
            key={block.id}
            className="absolute"
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              fontSize: `${block.fontSize}px`,
              color: block.fontColor,
              fontWeight: block.fontWeight,
              textAlign: block.textAlign || "left",
              transform:
                block.textAlign === "center"
                  ? "translateX(-50%)"
                  : block.textAlign === "right"
                    ? "translateX(-100%)"
                    : "none",
              whiteSpace: "nowrap",
              textShadow:
                block.fontColor === "#ffffff" || block.fontColor === "#fff"
                  ? "0 1px 3px rgba(0,0,0,0.5)"
                  : "none",
            }}
          >
            {displayText}
          </div>
        );
      })}
    </div>
  );
}

// ========================
// Default (Fallback) Renderer
// ========================

function DefaultCertificate({ certificate }: { certificate: any }) {
  return (
    <div className="relative flex aspect-[1.414/1] w-full flex-col items-center justify-center overflow-hidden border bg-white p-12 text-center text-black shadow-xl print:aspect-auto print:h-screen print:w-full print:border-none print:shadow-none">
      {/* Background Patterns */}
      <div className="bg-primary/20 absolute top-0 left-0 h-4 w-full"></div>
      <div className="bg-primary/20 absolute right-0 bottom-0 h-4 w-full"></div>

      {/* Content */}
      <div className="z-10 mx-auto max-w-2xl space-y-8">
        <div className="mb-4 flex justify-center">
          <ShieldCheck className="text-primary h-16 w-16" />
        </div>

        <div className="space-y-2">
          <h1 className="text-primary font-serif text-5xl font-bold tracking-wide">
            SERTIFIKAT
          </h1>
          <p className="text-muted-foreground text-xl font-light tracking-[0.2em] uppercase">
            Kompetensi
          </p>
        </div>

        <div className="py-4">
          <p className="text-muted-foreground text-lg">Diberikan kepada:</p>
          <h2 className="mt-2 font-serif text-4xl font-bold">
            {certificate.user?.name}
          </h2>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-lg">
            Telah berhasil menyelesaikan kursus:
          </p>
          <h3 className="text-primary text-3xl font-bold">
            {certificate.course?.title}
          </h3>
        </div>

        {/* Grade & Score Section */}
        {(certificate.finalScore != null || certificate.grade) && (
          <div className="flex items-center justify-center gap-8 rounded-lg border bg-slate-50 py-4">
            {certificate.grade && (
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Predikat</p>
                <p
                  className={`text-4xl font-bold ${getGradeColor(certificate.grade)}`}
                >
                  {certificate.grade}
                </p>
              </div>
            )}
            {certificate.finalScore != null && (
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Nilai Akhir</p>
                <p className="text-3xl font-bold">
                  {certificate.finalScore.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 grid w-full grid-cols-2 gap-12 border-t pt-12">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">Tanggal Diterbitkan</p>
            <p className="font-semibold">
              {new Date(certificate.issuedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">Instruktur</p>
            <p className="inline-block min-w-[150px] border-b border-black px-4 pb-1 font-serif text-lg font-semibold">
              {certificate.instructorName}
            </p>
          </div>
        </div>

        <div className="text-muted-foreground absolute bottom-8 left-8 text-left text-xs">
          <p>PAPEDI Verification</p>
          <p className="mt-1 font-mono">SN: {certificate.serialNumber}</p>
          {certificate.verificationToken && (
            <p className="mt-1 font-mono text-[10px]">
              Token: {certificate.verificationToken}
            </p>
          )}
          <p className="mt-1">
            Verify at:{" "}
            {typeof window !== "undefined" ? window.location.origin : ""}
            /certificates/{certificate.id}
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================
// Main Page
// ========================

export default function CertificatePage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: certificate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["certificate", id],
    queryFn: () => certificateService.getCertificate(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-destructive text-2xl font-bold">
          Sertifikat Tidak Ditemukan
        </h1>
        <p className="text-muted-foreground">ID Sertifikat tidak valid.</p>
        <Link href="/">
          <Button variant="outline">Kembali ke Beranda</Button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Check if template exists
  const template = certificate.course?.certificateTemplate;
  const hasTemplate = template?.bgImageUrl && template?.textBlocks?.length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
      {/* Print Controls - Hidden on Print */}
      <div className="mb-6 flex w-full max-w-4xl items-center justify-between print:hidden">
        <Link
          href="/student/dashboard"
          className="text-muted-foreground hover:text-primary text-sm"
        >
          &larr; Kembali ke Dashboard
        </Link>
        <div className="flex items-center gap-3">
          {certificate.status === "REVOKED" && (
            <Badge variant="destructive">REVOKED</Badge>
          )}
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      {/* Certificate Container */}
      <div className="w-full max-w-4xl">
        {hasTemplate ? (
          <TemplateCertificate
            certificate={certificate}
            bgImageUrl={template.bgImageUrl!}
            textBlocks={template.textBlocks}
          />
        ) : (
          <DefaultCertificate certificate={certificate} />
        )}
      </div>
    </div>
  );
}
