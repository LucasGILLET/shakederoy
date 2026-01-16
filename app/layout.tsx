import type { Metadata } from "next";
import { Fredoka, Lilita_One } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const lilitaOne = Lilita_One({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "ShakeDeRoy - L'écosystème cocktail",
  description: "Découvrez, créez et partagez des cocktails. Mode soirée inclus !",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${lilitaOne.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-surface-bg text-brand-dark font-sans selection:bg-brand-primary selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
