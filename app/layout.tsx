import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MCP Playground",
  description:
    "Interactive playground for testing Groq agents and MCP integrations.",
};

/**
 * Render the root application layout.
 *
 * Args:
 *     children (React.ReactNode): Nested application page content.
 *
 * Returns:
 *     JSX.Element: Root HTML document containing the application.
 *
 * Raises:
 *     None: No exceptions are intentionally raised.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}