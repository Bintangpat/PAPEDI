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
};
