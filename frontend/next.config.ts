import type { NextConfig } from "next";

const remoteImagePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [];

try {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
  const parsedApiUrl = new URL(apiUrl);
  remoteImagePatterns.push(new URL(`${parsedApiUrl.protocol}//${parsedApiUrl.host}`));
} catch {
  remoteImagePatterns.push(new URL("http://localhost:8080"));
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteImagePatterns,
  },
};

export default nextConfig;
