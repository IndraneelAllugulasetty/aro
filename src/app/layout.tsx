import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Aro | Agricultural Land & Investment",
  description: "Connect landowners, farmers, and investors seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased text-white bg-[#0B0F19] flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Aro.
            </h1>
            <nav className="flex space-x-6 text-sm font-medium text-gray-300">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/dashboard/landowner" className="hover:text-white transition-colors">List Land</a>
              <a href="/dashboard/farmer" className="hover:text-white transition-colors">Find Land</a>
              <a href="/dashboard/investor" className="hover:text-white transition-colors">Invest</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm bg-black/40">
          © {new Date().getFullYear()} Aro Platform. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
