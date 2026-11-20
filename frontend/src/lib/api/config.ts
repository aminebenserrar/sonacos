const DEFAULT_API_URL = "http://localhost:8080/api";

export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
}
