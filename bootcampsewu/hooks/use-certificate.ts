import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { certificateService } from "@/services/certificate.service";
import { TextBlock } from "@/types/course";

// ========================
// Admin — Template Hooks
// ========================

export const useAdminTemplates = () =>
  useQuery({
    queryKey: ["admin-certificate-templates"],
    queryFn: () => certificateService.adminGetTemplates(),
  });

export const useAdminTemplate = (courseId: string) =>
  useQuery({
    queryKey: ["admin-certificate-template", courseId],
    queryFn: () => certificateService.adminGetTemplate(courseId),
    enabled: !!courseId,
    retry: false,
  });

export const useAdminCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: certificateService.adminCreateTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-certificate-templates"] });
    },
  });
};

export const useAdminUpdateTemplate = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name?: string;
      bgImageUrl?: string | null;
      textBlocks?: TextBlock[];
    }) => certificateService.adminUpdateTemplate(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin-certificate-template", courseId],
      });
      qc.invalidateQueries({ queryKey: ["admin-certificate-templates"] });
    },
  });
};

// ========================
// Admin — Certificates Hooks
// ========================

export const useAdminCertificates = (courseId: string) =>
  useQuery({
    queryKey: ["admin-certificates", courseId],
    queryFn: () => certificateService.adminGetCourseCertificates(courseId),
    enabled: !!courseId,
  });

export const useAdminRevokeCertificate = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => certificateService.adminRevokeCertificate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-certificates", courseId] });
    },
  });
};
