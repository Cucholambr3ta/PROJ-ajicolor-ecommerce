import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Ajicolor Admin",
  description: "Panel de administración Ajicolor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans`}>{children}</body>
    </html>
  );
}
