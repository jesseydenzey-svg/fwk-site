import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const headingFont = localFont({
  src: [
    { path: "../public/fonts/latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fwk.example.com");

export const metadata: Metadata = {
  metadataBase,
  title: "FRANCK WATAT CASE | Coques sport et anime",
  description: "Coques d'iPhone, accessoires sport et designs anime par FRANCK WATAT CASE.",
  openGraph: {
    title: "FRANCK WATAT CASE | Coques sport et anime",
    description: "Découvre les designs FRANCK WATAT CASE pour ton iPhone.",
    locale: "fr_FR",
    type: "website",
    images: [{ url: new URL("/opengraph-image.png", metadataBase).toString(), width: 1200, height: 630, alt: "FRANCK WATAT CASE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FRANCK WATAT CASE | Coques sport et anime",
    description: "Découvre les designs FRANCK WATAT CASE pour ton iPhone.",
    images: ["/opengraph-image.png"],
  },
};

import { CartProvider } from "@/components/cart-provider";
import FloatingCartButton from "@/components/floating-cart-button";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${headingFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0e1116] text-[#edf3ff]">
        <CartProvider>
          {children}
          <FloatingCartButton />
        </CartProvider>
      </body>
    </html>
  );
}
