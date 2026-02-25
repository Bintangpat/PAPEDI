import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";

export const authService = {
  requestOtpLogin: async (email: string) => {
    const { data } = await api.post<ApiResponse<any>>(
      "/auth/request-otp-login",
      { email },
    );
    return data;
  },

  verifyOtp: async (
    email: string,
    otp: string,
    type: "LOGIN" | "REGISTER" | "RESET" = "LOGIN",
  ) => {
    const { data } = await api.post<ApiResponse<any>>("/auth/verify-otp", {
      email,
      otp,
      type,
    });
    return data;
  },

  resendOtp: async (email: string, type: "LOGIN" | "REGISTER" | "RESET") => {
    const { data } = await api.post<ApiResponse<any>>("/auth/resend-otp", {
      email,
      type,
    });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get<ApiResponse<any>>("/auth/me");
    return data;
  },

  updateProfile: async (profileData: {
    name?: string;
    bio?: string;
    portfolioUrl?: string;
    avatar?: string;
  }) => {
    const { data } = await api.patch<ApiResponse<any>>(
      "/auth/profile",
      profileData,
    );
    return data;
  },
};
