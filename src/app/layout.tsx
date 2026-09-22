import type { Metadata } from "next";
import { Outfit, Lobster } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "500", "900"], variable: "--font-outfit" });
const lobster = Lobster({ subsets: ["latin"], weight: "400", variable: "--font-lobster" });

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
      <body className={`${outfit.variable} ${lobster.variable} font-sans`}>
        <div className="film-grain" />
        {children}
      </body>
    </html>
  );
}
