import { QueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-hot-toast";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_SERVER_ENDPOINT || "http://localhost:3001/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth store
    let token = null;
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("xx-mu");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          token = parsedData?.tokens?.token?.access?.token;
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        data: config.data,
        params: config.params,
      }
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );

    return response;
  },
  (error: AxiosError) => {
    console.log("error: AxiosError ", error);
    // Standardized error handling
    const errorMessage = getErrorMessage(error);
    const statusCode = error.response?.status;

    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }`,
      {
        status: statusCode,
        message: errorMessage,
        data: error.response?.data,
      }
    );

    // Handle specific error cases
    switch (statusCode) {
      case 401:
        // Unauthorized - clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("xx-mu");
          // You might want to redirect to login page here
          toast.error("Session expired. Please log in again.");
        }
        break;
      case 403:
        toast.error(
          "Access denied. You do not have permission to perform this action."
        );
        break;
      case 404:
        toast.error("Resource not found.");
        break;
      case 429:
        toast.error("Too many requests. Please try again later.");
        break;
      case 500:
        toast.error("Server error. Please try again later.");
        break;
      default:
        // Show user-friendly error message
        toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error messages
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;

    // Handle different error response formats
    if (data.message) {
      return data.message;
    }

    if (data.error) {
      return typeof data.error === "string"
        ? data.error
        : data.error.message || "An error occurred";
    }

    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((err: any) => err.message || err).join(", ");
    }
  }

  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred";
}

// Create and configure QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Show error toast on mutation error
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred";
        toast.error(errorMessage);
      },
    },
  },
});

// Export types for better TypeScript support
export type ApiResponse<T = any> = {
  status: string;
  message?: string;
  data: T;
};

export type ApiError = {
  status: string;
  message: string;
  errors?: string[];
};
