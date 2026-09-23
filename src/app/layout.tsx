import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
});

const roboto = localFont({
  src: [{ path: "../../public/fonts/Roboto-Light.ttf", weight: "300", style: "normal" }],
  variable: "--font-roboto",
});

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
      <body className={`${poppins.variable} ${roboto.variable} font-sans`}>{children}</body>
    </html>
  );
}
