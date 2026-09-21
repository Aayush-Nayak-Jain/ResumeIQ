import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { AuthModal } from "../components/AuthModal";
import { Footer } from "../components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ResumeIQ — Resume Intelligence & Career Optimization Platform",
  description:
    "Construct high-impact ATS resumes, evaluate bullet point evidence, and tailor multiple role-specific versions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-emerald-600 selection:text-white bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <AuthModal />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
