"use client";

import { useEffect, useState } from "react";
import { studentDashboardService } from "@/services/student-dashboard.service";
import { DashboardCertificate } from "@/types/student-dashboard";
import { AlertCircle, Award, RefreshCcw, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [certificates, setCertificates] = useState<DashboardCertificate[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await studentDashboardService.getCertificates();
      setCertificates(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-red-600">Gagal memuat data</p>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sertifikat Saya</h1>
        <p className="text-muted-foreground">
          Daftar semua sertifikat yang telah diperoleh.
        </p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {certificates.length === 0 ? (
            <div className="py-16 text-center">
              <Award className="text-muted-foreground mx-auto h-10 w-10" />
              <p className="text-muted-foreground mt-3">
                Belum ada sertifikat. Selesaikan kursus untuk mendapatkan
                sertifikat.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kursus</TableHead>
                  <TableHead>Nomor Sertifikat</TableHead>
                  <TableHead>Tanggal Terbit</TableHead>
                  <TableHead className="w-[100px] text-center">
                    Status
                  </TableHead>
                  <TableHead className="w-[80px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">
                      {cert.course.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {cert.serialNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(cert.issuedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="text-xs">
                        Valid
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/certificates/${cert.id}`}>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
