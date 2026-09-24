import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/styled-registry";

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
  title: {
    default: "Ajicolor — Poleras de bandas",
    template: "%s | Ajicolor",
  },
  description: "Poleras exclusivas de bandas y artistas, hechas en Chile. Colecciones limitadas para melómanos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("theme");
                  var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
                  if (dark) document.documentElement.classList.add("dark");
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${poppins.variable} ${roboto.variable} font-sans`}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
