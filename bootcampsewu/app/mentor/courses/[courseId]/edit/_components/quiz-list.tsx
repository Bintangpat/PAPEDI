"use client";

import { Course } from "@/types/course";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface QuizListProps {
  course: Course;
}

export function QuizList({ course }: QuizListProps) {
  const modulesWithQuiz = course.modules?.filter((m) => !!m.quiz) || [];

  if (modulesWithQuiz.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
        <FileText className="h-8 w-8 opacity-20" />
        <p>Belum ada quiz yang dibuat di modul mana pun.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modul</TableHead>
          <TableHead>Passing Score</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modulesWithQuiz.map((module) => (
          <TableRow key={module.id}>
            <TableCell className="font-medium">{module.title}</TableCell>
            <TableCell>
              <Badge variant="secondary">{module.quiz?.passingScore}%</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link href={`/mentor/modules/${module.id}/quiz`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Quiz
                  </Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
