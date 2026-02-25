"use client";

import { useState } from "react";
import Link from "next/link";
import { Course } from "@/types/course";
import { Module, Lesson } from "@/types/module";
import { Project } from "@/types/project";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash,
  FileText,
  Video,
  MoreVertical,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { moduleService, lessonService } from "@/services/module.service";
import { projectService } from "@/services/project.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LessonForm } from "./lesson-form";
import { ProjectForm } from "./project-form";

interface ModulesListProps {
  course: Course;
}

export function ModulesList({ course }: ModulesListProps) {
  const queryClient = useQueryClient();
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  // Lesson Dialog State
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(
    undefined,
  );
  const [nextLessonOrder, setNextLessonOrder] = useState(1);

  // Project Dialog State
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [selectedProjectModuleId, setSelectedProjectModuleId] = useState<
    string | null
  >(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const createModuleMutation = useMutation({
    mutationFn: (title: string) =>
      moduleService.createModule({
        title,
        courseId: course.id,
        order: (course.modules?.length || 0) + 1,
      }),
    onSuccess: () => {
      toast.success("Modul berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["course", course.id] });
      setIsCreateModuleOpen(false);
      setNewModuleTitle("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan modul");
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: moduleService.deleteModule,
    onSuccess: () => {
      toast.success("Modul berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["course", course.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menghapus modul");
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: lessonService.deleteLesson,
    onSuccess: () => {
      toast.success("Materi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["course", course.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menghapus materi");
    },
  });

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

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    createModuleMutation.mutate(newModuleTitle);
  };

  const openAddLesson = (moduleId: string, currentLessons: Lesson[] = []) => {
    setSelectedModuleId(moduleId);
    setSelectedLesson(undefined);
    setNextLessonOrder(currentLessons.length + 1);
    setIsLessonOpen(true);
  };

  const openEditLesson = (moduleId: string, lesson: Lesson) => {
    setSelectedModuleId(moduleId);
    setSelectedLesson(lesson);
    setIsLessonOpen(true);
  };

  const openProjectManager = (moduleId: string, project?: Project | null) => {
    setSelectedProjectModuleId(moduleId);
    setSelectedProject(project || null);
    setIsProjectOpen(true);
  };

  const sortedModules = [...(course.modules || [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modul Kursus</h2>
        <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Modul
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Modul Baru</DialogTitle>
              <DialogDescription>
                Buat modul baru untuk mengelompokkan materi pembelajaran Anda.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Modul</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Pengenalan React"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !newModuleTitle.trim() || createModuleMutation.isPending
                  }
                >
                  {createModuleMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedModules.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">
          Belum ada modul. Klik "Tambah Modul" untuk mulai membuat materi.
        </div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4">
          {sortedModules.map((module) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="bg-card rounded-lg border px-4"
            >
              <div className="flex items-center gap-2 py-4">
                <div className="cursor-move text-slate-400 hover:text-slate-600">
                  <GripVertical className="h-5 w-5" />
                </div>
                <AccordionTrigger className="flex-1 py-0 hover:no-underline">
                  <span className="text-left font-medium">{module.title}</span>
                </AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="mr-2">
                    {module.lessons?.length || 0} Materi
                  </Badge>
                  {module.project ? (
                    <Badge
                      variant="default"
                      className="mr-2 bg-indigo-500 hover:bg-indigo-600"
                    >
                      <Briefcase className="mr-1 h-3 w-3" /> Project
                    </Badge>
                  ) : null}
                  {module.quiz ? (
                    <Badge
                      variant="default"
                      className="mr-2 bg-emerald-500 hover:bg-emerald-600"
                    >
                      <FileText className="mr-1 h-3 w-3" /> Quiz
                    </Badge>
                  ) : null}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Modul
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          openProjectManager(module.id, module.project)
                        }
                      >
                        <Briefcase className="mr-2 h-4 w-4" /> Kelola Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `/mentor/modules/${module.id}/quiz`)
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" /> Kelola Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          if (
                            confirm(
                              "Apakah Anda yakin ingin menghapus modul ini? Semua materi di dalamnya akan ikut terhapus.",
                            )
                          ) {
                            deleteModuleMutation.mutate(module.id);
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Hapus Modul
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="pr-4 pb-4 pl-10">
                <div className="space-y-2">
                  {module.lessons && module.lessons.length > 0
                    ? module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="group flex items-center justify-between rounded-md border bg-slate-50 p-2 transition-colors hover:bg-white dark:bg-slate-900"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.type === "VIDEO" ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                            <Badge variant="outline" className="text-[10px]">
                              Lesson
                            </Badge>
                          </div>
                          <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditLesson(module.id, lesson)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              onClick={() => {
                                if (confirm("Hapus materi ini?")) {
                                  deleteLessonMutation.mutate(lesson.id);
                                }
                              }}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    : null}

                  {/* Inline Quiz */}
                  {module.quiz && (
                    <div className="group flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-50/30 p-2 transition-colors hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">
                          Quiz: Modul ini
                        </span>
                        <Badge
                          variant="default"
                          className="bg-emerald-500 text-[10px] hover:bg-emerald-600"
                        >
                          Quiz
                        </Badge>
                      </div>
                      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Link href={`/mentor/modules/${module.id}/quiz`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </Link>
                        {/* Quiz delete functionality could be added if service exists, 
                            for now we just allow editing. */}
                      </div>
                    </div>
                  )}

                  {/* Inline Project */}
                  {module.project && (
                    <div className="group flex items-center justify-between rounded-md border border-indigo-100 bg-indigo-50/30 p-2 transition-colors hover:bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-900/10">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium">
                          Project: {module.project.title}
                        </span>
                        <Badge
                          variant="default"
                          className="bg-indigo-500 text-[10px] hover:bg-indigo-600"
                        >
                          Project
                        </Badge>
                      </div>
                      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            openProjectManager(module.id, module.project)
                          }
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm("Hapus project ini?")) {
                              deleteProjectMutation.mutate(module.project!.id);
                            }
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {(!module.lessons || module.lessons.length === 0) &&
                    !module.quiz &&
                    !module.project && (
                      <div className="text-muted-foreground py-2 text-center text-sm">
                        Belum ada materi, quiz, atau project.
                      </div>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => openAddLesson(module.id, module.lessons)}
                  >
                    <Plus className="mr-2 h-3 w-3" /> Tambah Materi
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Lesson Dialog */}
      <Dialog open={isLessonOpen} onOpenChange={setIsLessonOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? "Edit Materi" : "Tambah Materi Baru"}
            </DialogTitle>
            <DialogDescription>
              {selectedLesson
                ? "Perbarui konten materi pembelajaran."
                : "Tambahkan video atau artikel ke modul ini."}
            </DialogDescription>
          </DialogHeader>
          {selectedModuleId && (
            <LessonForm
              moduleId={selectedModuleId}
              lesson={selectedLesson}
              order={nextLessonOrder}
              onSuccess={() => setIsLessonOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={isProjectOpen} onOpenChange={setIsProjectOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Kelola Project Akhir Modul</DialogTitle>
            <DialogDescription>
              Setiap modul bisa memiliki satu project akhir sebagai tugas
              praktik.
            </DialogDescription>
          </DialogHeader>
          {selectedProjectModuleId && (
            <div className="space-y-4">
              <ProjectForm
                moduleId={selectedProjectModuleId}
                project={selectedProject}
                onSuccess={() => setIsProjectOpen(false)}
              />
              {selectedProject && (
                <div className="border-t pt-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      if (confirm("Yakin ingin menghapus project ini?")) {
                        deleteProjectMutation.mutate(selectedProject.id);
                        setIsProjectOpen(false);
                      }
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Hapus Project
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
