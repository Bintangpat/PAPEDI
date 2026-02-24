"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/project";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  deadline: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  moduleId: string;
  project?: Project | null;
  onSuccess: () => void;
}

export function ProjectForm({
  moduleId,
  project,
  onSuccess,
}: ProjectFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      deadline: project?.deadline ? new Date(project.deadline) : undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      projectService.createProject({
        moduleId,
        title: values.title,
        description: values.description,
        deadline: values.deadline,
      }),
    onSuccess: () => {
      toast.success("Project berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["course"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal membuat project");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      projectService.updateProject(project!.id, {
        title: values.title,
        description: values.description,
        deadline: values.deadline,
      }),
    onSuccess: () => {
      toast.success("Project berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["course"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui project");
    },
  });

  function onSubmit(values: FormValues) {
    if (project) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Project</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Buat Landing Page" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi & Instruksi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan detail tugas yang harus dikerjakan siswa..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deadline (Opsional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pilih tanggal deadline</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Siswa diharapkan mengumpulkan tugas sebelum tanggal ini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {project ? "Simpan Perubahan" : "Simpan Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
