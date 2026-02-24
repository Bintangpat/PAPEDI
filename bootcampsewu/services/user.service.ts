import api from "@/lib/axios";
import { User, ApiResponse } from "@/types"; // Correct import

export interface AdminUser extends User {
  isVerified: boolean;
  _count?: {
    enrollments: number;
    createdCourses: number;
  };
}

export interface GetUsersResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface UpdateUserParams {
  role?: string; // Should match Role enum if possible
  isVerified?: boolean;
  name?: string;
  email?: string;
  bio?: string;
}

export const userService = {
  getUsers: async (params?: GetUsersParams) => {
    const { data } = await api.get<ApiResponse<GetUsersResponse>>("/users", {
      params,
    });
    return data;
  },

  getUserById: async (id: string) => {
    const { data } = await api.get<ApiResponse<AdminUser>>(`/users/${id}`);
    return data;
  },

  updateUser: async (id: string, data: UpdateUserParams) => {
    const { data: res } = await api.patch<ApiResponse<AdminUser>>(
      `/users/${id}`,
      data,
    );
    return res;
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return data;
  },
};
