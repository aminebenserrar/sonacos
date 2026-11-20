import type { ApiErrorResponse } from "@/types/api";
import { getApiBaseUrl } from "@/lib/api/config";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: HeadersInit;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  validationErrors?: Record<string, string>;
  payload?: unknown;

  constructor(
    status: number,
    message: string,
    options?: {
      code?: string;
      validationErrors?: Record<string, string>;
      payload?: unknown;
    },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = options?.code;
    this.validationErrors = options?.validationErrors;
    this.payload = options?.payload;
  }
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  if (!query) {
    return url.toString();
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    body: isFormData
      ? (options.body as FormData)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await readResponseBody(response);

  if (!response.ok) {
    const apiError = payload as ApiErrorResponse | null;
    throw new ApiClientError(
      response.status,
      apiError?.message ?? "La requete API a echoue",
      {
        code: apiError?.code,
        validationErrors: apiError?.validationErrors,
        payload,
      },
    );
  }

  return payload as T;
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
