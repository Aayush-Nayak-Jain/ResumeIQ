import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import { AuthModal } from "../components/AuthModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ResumeIQ — AI Resume Intelligence Platform",
  description:
    "Intelligent ATS scoring, semantic job matching, evidence quality analysis, and multi-version resume optimization platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <AuthModal />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
            <p>© 2026 AI Resume Intelligence Platform. Free-Tier Architecture • MCA Capstone Engineering Project.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
