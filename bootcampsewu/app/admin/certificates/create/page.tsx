"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

// Inline ID generator (no external dep required)
const generateId = () => crypto.randomUUID();

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Save,
  Eye,
  GripVertical,
  X,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Hooks & Types
import { useAdminCourses } from "@/hooks/use-course";
import {
  useAdminTemplate,
  useAdminCreateTemplate,
  useAdminUpdateTemplate,
} from "@/hooks/use-certificate";
import { TextBlock, CertificateTemplate } from "@/types/course";
import { Course } from "@/types/course";
import { certificateService } from "@/services/certificate.service";

// ========================
// Constants
// ========================

const AVAILABLE_VARIABLES = [
  { key: "{{studentName}}", label: "Nama Peserta" },
  { key: "{{courseName}}", label: "Nama Kursus" },
  { key: "{{serialNumber}}", label: "Serial Number" },
  { key: "{{issuedDate}}", label: "Tanggal Terbit" },
  { key: "{{grade}}", label: "Grade" },
  { key: "{{finalScore}}", label: "Nilai Akhir" },
  { key: "{{instructorName}}", label: "Nama Instruktur" },
];

const DUMMY_DATA: Record<string, string> = {
  "{{studentName}}": "Budi Santoso",
  "{{courseName}}": "Web Development Bootcamp",
  "{{serialNumber}}": "BS-1234567890-ABCD",
  "{{issuedDate}}": "25 Februari 2026",
  "{{grade}}": "A",
  "{{finalScore}}": "92",
  "{{instructorName}}": "BootcampSewu Instructor",
};

// ========================
// Add Text Block Dialog
// ========================

function AddBlockDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (block: Omit<TextBlock, "id" | "x" | "y">) => void;
}) {
  const [variable, setVariable] = useState("{{studentName}}");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#1a1a1a");
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("normal");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left",
  );

  const handleAdd = () => {
    onAdd({ variable, fontSize, fontColor, fontWeight, textAlign });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Blok Teks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Variabel</Label>
            <Select value={variable} onValueChange={setVariable}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VARIABLES.map((v) => (
                  <SelectItem key={v.key} value={v.key}>
                    {v.label}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({v.key})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ukuran Font (px)</Label>
              <Input
                type="number"
                min={8}
                max={120}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Warna Teks</Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border"
                />
                <Input
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
          <div>
            <Label>Ketebalan Font</Label>
            <Select
              value={fontWeight}
              onValueChange={(v) => setFontWeight(v as "normal" | "bold")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Perataan Teks</Label>
            <div className="mt-1 flex items-center gap-1">
              <Button
                variant={textAlign === "left" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setTextAlign("left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={textAlign === "center" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setTextAlign("center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={textAlign === "right" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setTextAlign("right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Preview */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-muted-foreground mb-1 text-xs">Preview:</p>
            <span
              style={{
                fontSize: `${Math.min(fontSize, 32)}px`,
                color: fontColor,
                fontWeight,
                textAlign: textAlign,
                display: "block",
              }}
            >
              {DUMMY_DATA[variable] || variable}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Tambah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========================
// Edit Block Panel
// ========================

function EditBlockPanel({
  block,
  onChange,
  onRemove,
}: {
  block: TextBlock;
  onChange: (id: string, updates: Partial<TextBlock>) => void;
  onRemove: (id: string) => void;
}) {
  const label =
    AVAILABLE_VARIABLES.find((v) => v.key === block.variable)?.label ||
    block.variable;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
      <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{label}</span>
          <Badge variant="outline" className="shrink-0 text-xs">
            {block.variable}
          </Badge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={block.fontColor}
              onChange={(e) =>
                onChange(block.id, { fontColor: e.target.value })
              }
              className="h-5 w-5 cursor-pointer rounded border"
            />
          </div>
          <Input
            type="number"
            min={8}
            max={120}
            value={block.fontSize}
            onChange={(e) =>
              onChange(block.id, { fontSize: Number(e.target.value) })
            }
            className="h-6 w-14 px-1 text-xs"
          />
          <span className="text-muted-foreground text-xs">px</span>
          <select
            value={block.fontWeight}
            onChange={(e) =>
              onChange(block.id, {
                fontWeight: e.target.value as "normal" | "bold",
              })
            }
            className="h-6 rounded border bg-transparent px-1 text-xs"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
          <div className="flex items-center rounded border">
            <button
              onClick={() => onChange(block.id, { textAlign: "left" })}
              className={cn(
                "px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700",
                block.textAlign === "left" || !block.textAlign
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                  : "",
              )}
            >
              <AlignLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => onChange(block.id, { textAlign: "center" })}
              className={cn(
                "border-x px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700",
                block.textAlign === "center"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                  : "",
              )}
            >
              <AlignCenter className="h-3 w-3" />
            </button>
            <button
              onClick={() => onChange(block.id, { textAlign: "right" })}
              className={cn(
                "px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700",
                block.textAlign === "right"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                  : "",
              )}
            >
              <AlignRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(block.id)}
        className="ml-1 shrink-0 text-red-400 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ========================
// Canvas Editor
// ========================

function CertificateCanvas({
  bgImage,
  textBlocks,
  onUpdateBlock,
  previewMode,
}: {
  bgImage: string | null;
  textBlocks: TextBlock[];
  onUpdateBlock: (id: string, updates: Partial<TextBlock>) => void;
  previewMode: boolean;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, block: TextBlock) => {
      if (previewMode) return;
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      draggingRef.current = {
        id: block.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: block.x,
        origY: block.y,
      };
    },
    [previewMode],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = ((e.clientX - draggingRef.current.startX) / rect.width) * 100;
      const dy = ((e.clientY - draggingRef.current.startY) / rect.height) * 100;
      const newX = Math.max(0, Math.min(95, draggingRef.current.origX + dx));
      const newY = Math.max(0, Math.min(95, draggingRef.current.origY + dy));
      onUpdateBlock(draggingRef.current.id, { x: newX, y: newY });
    };

    const onMouseUp = () => {
      draggingRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onUpdateBlock]);

  return (
    <div
      ref={canvasRef}
      className="relative w-full overflow-hidden rounded-xl border shadow-lg select-none"
      style={{
        aspectRatio: "1.414 / 1", // A4 landscape ratio
        background: bgImage
          ? `url(${bgImage}) center/cover no-repeat`
          : "linear-gradient(135deg, #1e3a5f 0%, #26a5a5 100%)",
      }}
    >
      {/* Placeholder if no image */}
      {!bgImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
          <ImageIcon className="mb-2 h-12 w-12" />
          <span className="text-sm">Upload gambar background</span>
        </div>
      )}

      {/* Text Blocks */}
      {textBlocks.map((block) => {
        const displayText = previewMode
          ? (DUMMY_DATA[block.variable] ?? block.variable)
          : block.variable;

        return (
          <div
            key={block.id}
            onMouseDown={(e) => handleMouseDown(e, block)}
            style={{
              position: "absolute",
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
              cursor: previewMode ? "default" : "move",
              userSelect: "none",
              whiteSpace: "nowrap",
              textShadow:
                block.fontColor === "#ffffff" || block.fontColor === "#fff"
                  ? "0 1px 3px rgba(0,0,0,0.5)"
                  : "none",
            }}
          >
            {!previewMode && (
              <div
                className="absolute -inset-1 rounded border border-dashed border-white/60"
                style={{ pointerEvents: "none" }}
              />
            )}
            {displayText}
          </div>
        );
      })}
    </div>
  );
}

// ========================
// Main Page
// ========================

export default function CreateCertificateTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCourseId = searchParams.get("courseId");

  // Form state
  const [selectedCourseId, setSelectedCourseId] = useState(
    prefilledCourseId || "",
  );
  const [templateName, setTemplateName] = useState("Sertifikat Kelulusan");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Data
  const { data: coursesData } = useAdminCourses({
    page: 1,
    search: "",
    sort: "date_desc",
  });
  const { data: existingTemplate, isLoading: loadingTemplate } =
    useAdminTemplate(selectedCourseId);

  const createMutation = useAdminCreateTemplate();
  const updateMutation = useAdminUpdateTemplate(selectedCourseId);

  // Load existing template when course selected
  useEffect(() => {
    if (existingTemplate) {
      setTemplateName(existingTemplate.name);
      setBgImageUrl(existingTemplate.bgImageUrl ?? null);
      setBgImage(existingTemplate.bgImageUrl ?? null);
      setTextBlocks(existingTemplate.textBlocks as TextBlock[]);
    } else if (!loadingTemplate) {
      // reset when switching to a course without template
      if (!existingTemplate && selectedCourseId) {
        setTemplateName("Sertifikat Kelulusan");
        setBgImage(null);
        setBgImageUrl(null);
        setTextBlocks([]);
      }
    }
  }, [existingTemplate, loadingTemplate, selectedCourseId]);

  // Image upload handler — uploads to Cloudinary via backend API
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPEG, PNG, dll).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await certificateService.uploadImage(file);
      setBgImage(url);
      setBgImageUrl(url);
      toast.success("Gambar berhasil diupload!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengupload gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  // Text block handlers
  const handleAddBlock = (block: Omit<TextBlock, "id" | "x" | "y">) => {
    setTextBlocks((prev) => [
      ...prev,
      { ...block, id: generateId(), x: 10, y: 10 + prev.length * 10 },
    ]);
  };

  const handleUpdateBlock = useCallback(
    (id: string, updates: Partial<TextBlock>) => {
      setTextBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      );
    },
    [],
  );

  const handleRemoveBlock = (id: string) => {
    setTextBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Save
  const handleSave = async () => {
    if (!selectedCourseId) {
      toast.error("Pilih kursus terlebih dahulu.");
      return;
    }
    if (!templateName.trim()) {
      toast.error("Nama template wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        courseId: selectedCourseId,
        name: templateName,
        bgImageUrl: bgImageUrl,
        textBlocks,
      };

      if (existingTemplate) {
        await updateMutation.mutateAsync({
          name: templateName,
          bgImageUrl: bgImageUrl,
          textBlocks,
        });
        toast.success("Template berhasil diperbarui!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Template berhasil dibuat!");
      }

      router.push(`/admin/certificates/${selectedCourseId}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal menyimpan template.");
    } finally {
      setIsSaving(false);
    }
  };

  const courses = coursesData?.data ?? [];
  const isEditing = !!existingTemplate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
            <Link href="/admin/courses">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing
              ? "Edit Template Sertifikat"
              : "Buat Template Sertifikat"}
          </h2>
          <p className="text-muted-foreground mt-1">
            Upload gambar background dan atur posisi blok teks dinamis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode((v) => !v)}
          >
            <Eye className="mr-1 h-4 w-4" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedCourseId}>
            <Save className="mr-1 h-4 w-4" />
            {isSaving
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Simpan Template"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left — Settings Panel */}
        <div className="space-y-4 xl:col-span-1">
          {/* Course Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pengaturan Template</CardTitle>
              <CardDescription>
                Pilih kursus dan beri nama template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kursus</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                  disabled={!!prefilledCourseId && isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih kursus..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c: Course) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({c.category})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourseId && loadingTemplate && (
                  <Skeleton className="mt-2 h-4 w-32" />
                )}
                {selectedCourseId && isEditing && (
                  <p className="mt-1 text-xs text-blue-600">
                    ✓ Template sudah ada — mode edit
                  </p>
                )}
              </div>

              <div>
                <Label>Nama Template</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Sertifikat Kelulusan"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Gambar Background</CardTitle>
              <CardDescription>
                Upload gambar sebagai latar sertifikat (JPEG/PNG, maks. 5 MB).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10",
                  isUploading && "pointer-events-none opacity-50",
                )}
              >
                {isUploading ? (
                  <>
                    <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <span className="text-sm text-gray-500">Mengupload...</span>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {bgImage ? "Ganti Gambar" : "Klik atau drag untuk upload"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
              {bgImage && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-green-600">
                    ✓ Gambar terpilih
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      setBgImage(null);
                      setBgImageUrl(null);
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Hapus
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Text Blocks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Blok Teks</CardTitle>
                  <CardDescription className="mt-0.5">
                    Drag blok di canvas untuk mengatur posisi.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Tambah
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {textBlocks.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  Belum ada blok teks. Klik tambah untuk memulai.
                </p>
              ) : (
                <div className="space-y-2">
                  {textBlocks.map((block) => (
                    <EditBlockPanel
                      key={block.id}
                      block={block}
                      onChange={handleUpdateBlock}
                      onRemove={handleRemoveBlock}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variable Reference */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Variabel Tersedia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {AVAILABLE_VARIABLES.map((v) => (
                  <div
                    key={v.key}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{v.label}</span>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] dark:bg-gray-700">
                      {v.key}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Canvas Preview */}
        <div className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {previewMode ? "Preview Sertifikat" : "Canvas Editor"}
                </CardTitle>
                {previewMode && (
                  <Badge className="bg-blue-500 text-white">
                    Mode Preview — Data Contoh
                  </Badge>
                )}
              </div>
              <CardDescription>
                {previewMode
                  ? "Tampilan sertifikat dengan data contoh."
                  : "Drag blok teks untuk mengatur posisi di atas gambar."}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <CertificateCanvas
                bgImage={bgImage}
                textBlocks={textBlocks}
                onUpdateBlock={handleUpdateBlock}
                previewMode={previewMode}
              />
              {!previewMode && textBlocks.length > 0 && (
                <p className="text-muted-foreground mt-2 text-center text-xs">
                  💡 Klik dan drag teks di canvas untuk mengatur posisinya
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Block Dialog */}
      <AddBlockDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddBlock}
      />
    </div>
  );
}
