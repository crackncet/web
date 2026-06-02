import axios, { AxiosError, AxiosResponse } from "axios";

// --- Types matching Backend Responses ---
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  meta?: any;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  errors?: any[];
}

// --- Custom Error Class for Frontend ---
// This allows TanStack Query to easily access error.message and error.errors
export class FrontendApiError extends Error {
  public statusCode: number;
  public errors: any[];

  constructor(message: string, statusCode: number, errors: any[] = []) {
    super(message);
    this.name = "FrontendApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// --- Axios Instance Setup ---
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Response & Error Interceptor ---
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiSuccessResponse>) => {
    // Return the full response to keep TypeScript and Axios happy.
    // In your API functions, you will access the payload via `response.data`.
    return response;
  },
  (error: AxiosError<ApiErrorPayload>) => {
    // Scenario 1: We received an ApiError response from the backend
    if (error.response) {
      const { status, data } = error.response;
      
      const message = data?.message || "An unexpected error occurred";
      const errors = data?.errors || [];

      // Example: Global 401 handling (could emit event, redirect, or trigger refresh)
      // if (status === 401) { handleSessionExpiry() }

      throw new FrontendApiError(message, status, errors);
    }
    
    // Scenario 2: Network error or server didn't respond
    const defaultMessage = error.message === "Network Error" 
      ? "Unable to connect to the server. Please check your internet connection."
      : (error.message || "Something went wrong");

    throw new FrontendApiError(defaultMessage, 500);
  }
);
