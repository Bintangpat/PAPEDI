"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function MentorSubmissionsPage() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["mentor-submissions"],
    queryFn: async () => {
      const res = await api.get("/mentor/submissions");
      return res.data.data;
    },
  });

  if (isLoading) return <div>Loading submissions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Penilaian Project
          </h1>
          <p className="text-muted-foreground">
            Daftar tugas akhir siswa yang perlu dinilai.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Kursus</TableHead>
              <TableHead>Tanggal Submit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Tidak ada submission pending.
                </TableCell>
              </TableRow>
            ) : (
              submissions?.map((sub: any) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{sub.student.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {sub.student.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{sub.course.title}</TableCell>
                  <TableCell>
                    {sub.submittedAt
                      ? format(new Date(sub.submittedAt), "dd MMM yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.status === "PENDING"
                          ? "secondary"
                          : sub.status === "LULUS"
                            ? "default" // "success" if defined
                            : "destructive"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" asChild>
                      <Link href={`/mentor/submissions/${sub.id}`}>Nilai</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
