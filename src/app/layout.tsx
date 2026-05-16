import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getCurrentUser, logout } from "@/actions";
import { AIAssistant } from "@/components/AIAssistant";
import { LanguageGate } from "@/components/LanguageGate";
import { HeaderActions } from "@/components/HeaderActions";
import { getServerTranslation } from "@/lib/translations";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Aro | Agricultural Land & Investment",
  description: "Connect landowners, farmers, and investors seamlessly.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getServerTranslation();
  const userPromise = getCurrentUser();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased text-white bg-[#0B0F19] flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <LanguageGate />
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Aro.
              </Link>
              <nav className="hidden sm:flex space-x-6 text-sm font-medium text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  {t.home}
                </Link>
                <Link href="/messages" className="hover:text-white transition-colors">
                  {t.messages}
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3 text-sm">
              {userPromise.then((user) =>
                user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-gray-300">
                      <span className="text-gray-500">Signed in as</span>
                      <span className="font-semibold text-white">{user.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 border border-white/10">
                        {user.role}
                      </span>
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="px-3 py-1.5 rounded-lg bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/25 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <HeaderActions user={user} />
                    <form action={logout}>
                      <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-colors">
                        {t.logout}
                      </button>
                    </form>
                  </div>
                ) : (
                  <HeaderActions user={null} />
                )
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <AIAssistant />

        <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm bg-black/40">
          © {new Date().getFullYear()} Aro Platform. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
