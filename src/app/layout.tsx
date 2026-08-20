import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { NotificationsProvider } from "@/components/providers/NotificationsProvider";
import "./globals.css";

const playfairDisplay = localFont({
  variable: "--font-playfair",
  src: [
    { path: "../fonts/playfair-display-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/playfair-display-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/playfair-display-800.woff2", weight: "800", style: "normal" },
  ],
});

// Vercel project/domain is unchanged by this rebrand — see README for how to update it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oson-navbat.vercel.app";
const SITE_NAME = "Qulaynavbat";
const SITE_TITLE = "Qulaynavbat - Navbat kutishni unuting!";
const SITE_DESCRIPTION = "O'zingizga yoqqan usta yoki salonni toping va bir necha soniyada joy band qiling.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Qulaynavbat",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f5efe2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${GeistSans.variable} ${GeistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="h-full">
        <LanguageProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
