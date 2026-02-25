"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Course } from "@/types/course";
import { Module } from "@/types/module";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Video,
  FileQuestion,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentItem {
  id: string;
  type: "lesson" | "quiz" | "project";
  label: string;
  icon: "video" | "text" | "quiz" | "project";
  href: string;
  order: number; // for sorting within module
}

interface ModuleProgressPanelProps {
  course: Course;
  courseId: string;
  completedLessons?: string[];
  completedQuizzes?: string[];
  completedProjects?: string[];
}

// ─── Helper: build ordered content list for a module ──────────────────────────

export function buildModuleContentList(
  module: Module,
  courseId: string,
): ContentItem[] {
  const items: ContentItem[] = [];

  // Lessons sorted by order
  const sortedLessons = [...(module.lessons || [])].sort(
    (a, b) => a.order - b.order,
  );
  sortedLessons.forEach((lesson, i) => {
    items.push({
      id: lesson.id,
      type: "lesson",
      label: lesson.title,
      icon: lesson.type === "VIDEO" ? "video" : "text",
      href: `/learning/${courseId}/${lesson.id}`,
      order: i,
    });
  });

  // Quiz (after all lessons)
  if (module.quiz) {
    items.push({
      id: module.quiz.id,
      type: "quiz",
      label: "Quiz",
      icon: "quiz",
      href: `/learning/${courseId}/quiz/${module.quiz.id}`,
      order: sortedLessons.length,
    });
  }

  // Project (after quiz)
  if (module.project) {
    items.push({
      id: module.project.id,
      type: "project",
      label: `Project: ${module.project.title}`,
      icon: "project",
      href: `/learning/${courseId}/project/${module.project.id}`,
      order: sortedLessons.length + 1,
    });
  }

  return items;
}

// ─── Helper: build flat ordered list across ALL modules ───────────────────────

export function buildAllContentItems(course: Course): ContentItem[] {
  const sortedModules = [...(course.modules || [])].sort(
    (a, b) => a.order - b.order,
  );
  const allItems: ContentItem[] = [];
  sortedModules.forEach((module) => {
    allItems.push(...buildModuleContentList(module, course.id));
  });
  return allItems;
}

// ─── Icon component ───────────────────────────────────────────────────────────

function ItemIcon({ type }: { type: ContentItem["icon"] }) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "text":
      return <FileText className="h-4 w-4 text-green-500" />;
    case "quiz":
      return <FileQuestion className="h-4 w-4 text-emerald-500" />;
    case "project":
      return <Briefcase className="h-4 w-4 text-indigo-500" />;
  }
}

// ─── Status icon ──────────────────────────────────────────────────────────────

function StatusIcon({
  isCompleted,
  isCurrent,
}: {
  isCompleted: boolean;
  isCurrent: boolean;
}) {
  if (isCompleted) {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />;
  }
  if (isCurrent) {
    return (
      <PlayCircle className="h-4 w-4 shrink-0 animate-pulse text-blue-500" />
    );
  }
  return (
    <Circle className="text-muted-foreground h-4 w-4 shrink-0 opacity-40" />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ModuleProgressPanel({
  course,
  courseId,
  completedLessons = [],
  completedQuizzes = [],
  completedProjects = [],
}: ModuleProgressPanelProps) {
  const pathname = usePathname();

  const sortedModules = [...(course.modules || [])].sort(
    (a, b) => a.order - b.order,
  );

  const isItemCompleted = (item: ContentItem) => {
    switch (item.type) {
      case "lesson":
        return completedLessons.includes(item.id);
      case "quiz":
        return completedQuizzes.includes(item.id);
      case "project":
        return completedProjects.includes(item.id);
      default:
        return false;
    }
  };

  // Find which module is "active" (contains the current page)
  const activeModuleId = sortedModules.find((mod) => {
    const items = buildModuleContentList(mod, courseId);
    return items.some((item) => pathname === item.href);
  })?.id;

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase">
          Progres Kursus
        </h3>
        <Accordion
          type="multiple"
          defaultValue={activeModuleId ? [activeModuleId] : []}
          className="space-y-2"
        >
          {sortedModules.map((module, moduleIndex) => {
            const items = buildModuleContentList(module, courseId);
            const completedCount = items.filter((item) =>
              isItemCompleted(item),
            ).length;

            return (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="rounded-lg border px-3"
              >
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                      {moduleIndex + 1}
                    </span>
                    <span className="flex-1 font-medium">{module.title}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {completedCount}/{items.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-1 pl-1">
                    {items.map((item) => {
                      const completed = isItemCompleted(item);
                      const isCurrent = pathname === item.href;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                            isCurrent
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground",
                            completed &&
                              !isCurrent &&
                              "text-muted-foreground/70",
                          )}
                        >
                          <StatusIcon
                            isCompleted={completed}
                            isCurrent={isCurrent}
                          />
                          <ItemIcon type={item.icon} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </ScrollArea>
  );
}
