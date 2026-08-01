import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const storeNameAr = process.env.STORE_NAME || "وميض ستور";
const storeNameEn = process.env.STORE_NAME_EN || "Wameed Store";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wameedstore.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: `${storeNameAr} - تسوق أونلاين`,
    template: `%s | ${storeNameAr}`,
  },
  description:
    "متجرك الإلكتروني الشامل - اكتشف أفضل المنتجات بأسعار مذهلة مع توصيل سريع وضمان الجودة",
  keywords: [
    "متجر",
    "تسوق",
    "اونلاين",
    "منتجات",
    "عروض",
    "خصومات",
    "توصيل",
    storeNameEn,
    storeNameAr,
    "ecommerce",
    "shopping",
  ],
  authors: [{ name: storeNameAr }],
  creator: storeNameEn,
  publisher: storeNameEn,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: baseUrl,
    siteName: storeNameAr,
    title: `${storeNameAr} - تسوق أونلاين`,
    description:
      "متجرك الإلكتروني الشامل - اكتشف أفضل المنتجات بأسعار مذهلة مع توصيل سريع وضمان الجودة",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: storeNameAr,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${storeNameAr} - تسوق أونلاين`,
    description:
      "متجرك الإلكتروني الشامل - اكتشف أفضل المنتجات بأسعار مذهلة",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" dir="rtl" />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
