"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { certificateService } from "@/services/certificate.service";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, CheckCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
      {/* Print Controls - Hidden on Print */}
      <div className="mb-6 flex w-full max-w-4xl items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-primary text-sm"
        >
          &larr; Kembali ke Dashboard
        </Link>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* Certificate Container */}
      <div className="relative flex aspect-[1.414/1] w-full max-w-4xl flex-col items-center justify-center overflow-hidden border bg-white p-12 text-center text-black shadow-xl print:aspect-auto print:h-screen print:w-full print:border-none print:shadow-none">
        {/* Background Patterns (Optional) */}
        <div className="bg-primary/20 absolute top-0 left-0 h-4 w-full"></div>
        <div className="bg-primary/20 absolute right-0 bottom-0 h-4 w-full"></div>

        {/* Content */}
        <div className="z-10 mx-auto max-w-2xl space-y-8">
          <div className="mb-4 flex justify-center">
            <ShieldCheck className="text-primary h-16 w-16" />
            {/* Or Logo */}
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
              {certificate.user.name}
            </h2>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-lg">
              Telah berhasil menyelesaikan kursus:
            </p>
            <h3 className="text-primary text-3xl font-bold">
              {certificate.course.title}
            </h3>
            <p className="text-muted-foreground italic">
              "{certificate.course.description.substring(0, 100)}..."
            </p>
          </div>

          <div className="mt-12 grid w-full grid-cols-2 gap-12 border-t pt-12">
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground text-sm">
                Tanggal Diterbitkan
              </p>
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
            <p className="mt-1 font-mono">ID: {certificate.serialNumber}</p>
            <p className="mt-1">
              Verify at:{" "}
              {typeof window !== "undefined" ? window.location.origin : ""}
              /certificates/{certificate.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
