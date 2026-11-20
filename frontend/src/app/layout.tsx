import type { Metadata } from "next";
import { AppProviders } from "@/components/ui/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SONACOS",
  description: "Catalogue agricole et espaces métier SONACOS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
