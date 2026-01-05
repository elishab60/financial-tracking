import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WORTHFLOW | Wealth Cockpit",
  description: "Reprenez le contrôle de votre flux financier avec WORTHFLOW.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
