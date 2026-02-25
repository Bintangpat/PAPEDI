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
import { Pencil, Briefcase, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Project } from "@/types/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm } from "./project-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { toast } from "sonner";

interface ProjectListProps {
  course: Course;
}

export function ProjectList({ course }: ProjectListProps) {
  const queryClient = useQueryClient();
  const modulesWithProject = course.modules?.filter((m) => !!m.project) || [];

  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const deleteProjectMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      toast.success("Project berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["course", course.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menghapus project");
    },
  });

  const openEditProject = (moduleId: string, project: Project) => {
    setSelectedModuleId(moduleId);
    setSelectedProject(project);
    setIsProjectOpen(true);
  };

  if (modulesWithProject.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
        <Briefcase className="h-8 w-8 opacity-20" />
        <p>Belum ada project yang dibuat di modul mana pun.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modul</TableHead>
            <TableHead>Judul Project</TableHead>
            <TableHead>Passing Score</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modulesWithProject.map((module) => (
            <TableRow key={module.id}>
              <TableCell className="font-medium text-slate-500">
                {module.title}
              </TableCell>
              <TableCell>{module.project?.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {module.project?.passingScore}%
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditProject(module.id, module.project!)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      if (confirm("Hapus project ini?")) {
                        deleteProjectMutation.mutate(module.project!.id);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isProjectOpen} onOpenChange={setIsProjectOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project Modul</DialogTitle>
            <DialogDescription>
              Perbarui rincian project akhir untuk modul ini.
            </DialogDescription>
          </DialogHeader>
          {selectedModuleId && (
            <ProjectForm
              moduleId={selectedModuleId}
              project={selectedProject}
              onSuccess={() => setIsProjectOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
