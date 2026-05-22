import type { Metadata } from "next";
import { headers } from "next/headers";
import { Crimson_Pro, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/providers/CartProvider";

const serif = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const sans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CodaCo — A curated marketplace for death and dying",
  description:
    "CodaCo connects people with trusted goods and services for end-of-life planning, grief support, and meaningful farewells.",
  // Site-wide noindex while we're in private development. /homepage and
  // /preview-access also declare it explicitly so the public-facing
  // routes stay opted out even after this default is eventually flipped.
  robots: { index: false, follow: false },
};

// Routes that render their own chrome (logo bar, footer). proxy.ts
// sets x-pathname so we can branch here without restructuring every
// other route into a route group.
const CHROMELESS_PATHS = new Set(["/homepage", "/preview-access"]);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const showChrome = !CHROMELESS_PATHS.has(pathname);

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {showChrome ? (
          <CartProvider>
            <Nav />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
