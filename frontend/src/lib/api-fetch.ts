import { getAuthTokenServer } from "./cookie/cookie-server";
import { ServerResponseModel } from "./typedefs/server-response";

type ApiFetchOptions = {
  baseUrl?: string;
  withCredentials?: boolean;
  withUpload?: boolean;
  isBlob?: boolean;
} & RequestInit;

export async function apiFetch<T = any>(
  url: string,
  options?: ApiFetchOptions
): Promise<ServerResponseModel<T>> {
  try {
    const {
      withCredentials = false,
      withUpload = false,
      baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT,
      ...fetchOptions
    } = options || {};

    const headers: Record<string, any> = {
      ...fetchOptions?.headers,
      apikey: process.env.API_KEY || "",
    };

    if (withCredentials) {
      const accessToken = await getAuthTokenServer();
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      else
        return {
          success: false,
          statusCode: 401,
          message: "Unauthorized",
        };
    }

    if (!withUpload) headers["Content-Type"] = "application/json";
    if (options?.isBlob) headers["Accept"] = "application/octet-stream";

    const fullUrl = `${baseUrl}${url}`;
    const response = await fetch(fullUrl, { ...fetchOptions, headers });

    if (!response.ok) {
      let message = "Unknown error";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (_) {}
      return { success: false, statusCode: response.status, message };
    }

    if (options?.isBlob) {
      return {
        success: true,
        statusCode: response.status,
        data: (await response.blob()) as T,
      };
    }

    // Default: JSON
    const data = await response.json();
    return {
      success: true,
      statusCode: response.status,
      data: data.data ? (data.data as T) : (data as T),
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Unknown error",
    };
  }
}
