import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Personns',
  description: 'Employee management and compliance simplified',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
  <header className="border-b px-6 py-4 flex items-center justify-between">
    <div>
      <h1 className="text-xl font-bold tracking-tight">Personns</h1>
      <p className="text-xs text-gray-500">
        Employee management and compliance simplified
      </p>
    </div>

    <nav className="flex gap-6 text-sm">
  <a href="/dashboard" className="hover:underline">
    Dashboard
  </a>

  <a href="/employees" className="hover:underline">
    Team
  </a>

  <a href="/schedule" className="hover:underline">
    Schedule
  </a>
</nav>
  </header>

  <main className="flex-1">{children}</main>
</body>
    </html>
  );
}
