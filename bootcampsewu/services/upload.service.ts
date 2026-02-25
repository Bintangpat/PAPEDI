import api from "@/lib/axios";
import { ApiResponse } from "@/types";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export const uploadService = {
  /** Upload an image file to Cloudinary via the backend */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post<ApiResponse<UploadResult>>(
      "/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data.url;
  },
};
