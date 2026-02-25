"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Camera,
  Loader2,
  Save,
  User as UserIcon,
  Mail,
  FileText,
  Link2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { uploadService } from "@/services/upload.service";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  bio: z
    .string()
    .max(300, "Bio maksimal 300 karakter")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      portfolioUrl: user?.portfolioUrl || "",
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB.");
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadService.uploadImage(file);
      await authService.updateProfile({ avatar: url });
      updateUser({ avatar: url });
      toast.success("Foto profil berhasil diperbarui!");
    } catch {
      toast.error("Gagal mengunggah foto profil.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);
      const res = await authService.updateProfile({
        name: values.name,
        bio: values.bio || undefined,
        portfolioUrl: values.portfolioUrl || undefined,
      });
      if (res.success) {
        updateUser(res.data);
        toast.success("Profil berhasil diperbarui!");
      }
    } catch {
      toast.error("Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabels: Record<string, string> = {
    student: "Siswa",
    mentor: "Mentor",
    admin: "Admin",
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground text-sm">
          Kelola informasi akun dan profil Anda.
        </p>
      </div>

      {/* ── Avatar Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto Profil</CardTitle>
          <CardDescription>Klik gambar untuk mengganti foto.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              className="ring-offset-background ring-primary/20 hover:ring-primary/50 h-20 w-20 cursor-pointer ring-2 ring-offset-2 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-background bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:scale-110"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{user?.name}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <Badge variant="secondary" className="mt-1 text-xs capitalize">
              {roleLabels[user?.role || "student"]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Profile Form Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Akun</CardTitle>
          <CardDescription>
            Perbarui nama, bio, atau tautan portofolio Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserIcon className="h-3.5 w-3.5" /> Nama Lengkap
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" /> Bio
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ceritakan sedikit tentang dirimu..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-muted-foreground text-right text-xs">
                      {field.value?.length || 0}/300
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Portfolio URL */}
              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5" /> URL Portofolio
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://portofolio-kamu.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-muted-foreground text-xs">
                  Email tidak dapat diubah.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
