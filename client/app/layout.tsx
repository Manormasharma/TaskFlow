import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "A simple task manager to plan your work and track progress.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
