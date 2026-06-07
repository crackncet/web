import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiSuccessResponse } from "@/lib/api-client";
import { z } from "zod";

// ============================================================================
// 1. Validation Schemas & Types
// ============================================================================
// Note: We flattened the backend's `body` wrappers here. Axios automatically 
// sends these flat objects as `req.body` to match your Express backend.

export const loginSchema = z
  .object({
    identifier: z.string().min(3),
    method: z.enum(["PASSWORD", "OTP"]),
    password: z.string().min(8).optional(),
    otp: z.string().min(4).max(8).optional(),
  })
  .refine(
    (data) => (data.method === "PASSWORD" ? !!data.password : true),
    { message: "Password is required for PASSWORD login", path: ["password"] }
  )
  .refine(
    (data) => (data.method === "OTP" ? !!data.otp : true),
    { message: "OTP is required for OTP login", path: ["otp"] }
  );
export type LoginInput = z.infer<typeof loginSchema>;

export const sendSignUpOtpSchema = z.object({
  email: z.string().email(),
});
export type SendSignUpOtpInput = z.infer<typeof sendSignUpOtpSchema>;

export const signUpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  fullName: z.string().min(2).max(255),
  phone: z.string().min(10).max(15).optional().or(z.literal("")),
  password: z.string().min(8),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ============================================================================
// 2. Response Interfaces
// ============================================================================

export interface LoginResponse {
  userId?: string;
  fullName: string;
  email?: string;
  profileImage: string | null;
}

export interface UserProfile {
  id: string;
  isHod: boolean;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  globalRole: "STUDENT" | "TEAM_MEMBER" | "ADMIN";
  hodStreams?: { id: string; name: string }[];
}

// ============================================================================
// 3. API Functions
// ============================================================================

export const loginUserAPI = async (data: LoginInput) => {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auth/login", data);
  return response.data.data;
};

export const sendSignUpOtpAPI = async (data: SendSignUpOtpInput) => {
  await apiClient.post("/auth/sign-up/send-otp", data);
};

export const signUpAPI = async (data: SignUpInput) => {
  // Web sign-up typically returns the same user object structure as login upon success
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auth/sign-up", data);
  return response.data.data;
};

export const forgotPasswordAPI = async (data: ForgotPasswordInput) => {
  await apiClient.post("/auth/forgot-password", data);
};

export const resetPasswordAPI = async (data: ResetPasswordInput) => {
  await apiClient.post("/auth/reset-password", data);
};

export const refreshTokenAPI = async (data: RefreshTokenInput) => {
  // Only manually required if not strictly relying on httpOnly cookies in your interceptor flow
  const response = await apiClient.post<ApiSuccessResponse<any>>("/auth/refresh-token", data);
  return response.data.data;
};

export const logoutAPI = async () => {
  const response = await apiClient.post<ApiSuccessResponse<null>>("/auth/logout");
  return response.data.message;
};
// ============================================================================
// 4. React Query Hooks
// ============================================================================

export const useUser = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiSuccessResponse<UserProfile>>("/profile/details");
        return response.data.data;
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({ 
    mutationFn: loginUserAPI,
    onSuccess: () => {
      // Invalidate the authUser query to trigger fetching full profile details
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  });
};

export const useSendSignUpOtp = () => {
  return useMutation({ mutationFn: sendSignUpOtpAPI });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  return useMutation({ 
    mutationFn: signUpAPI,
    onSuccess: () => {
      // Invalidate the authUser query to trigger fetching full profile details
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAPI,
    onSettled: () => {
      // Clear the user cache regardless of whether the API call succeeds or fails
      queryClient.setQueryData(["authUser"], null);
      queryClient.removeQueries({ queryKey: ["authUser"] }); // Ensures it's fully wiped
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({ mutationFn: forgotPasswordAPI });
};

export const useResetPassword = () => {
  return useMutation({ mutationFn: resetPasswordAPI });
};

export const useRefreshToken = () => {
  return useMutation({ mutationFn: refreshTokenAPI });
};
