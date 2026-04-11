import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Lexend } from "next/font/google";
import "./globals.css";
import { ReducedMotionProvider } from "@/components/shared/ReducedMotionProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Founders Arcade",
    template: "%s · Founders Arcade",
  },
  description:
    "Founders Arcade — the interactive classroom games portal for GEMS Founders School, Masdar City Campus.",
  applicationName: "Founders Arcade",
  appleWebApp: {
    title: "Founders Arcade",
    capable: true,
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Founders Arcade",
    description:
      "Interactive classroom games for GEMS Founders School, Masdar City Campus.",
    siteName: "Founders Arcade",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${lexend.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <ReducedMotionProvider>{children}</ReducedMotionProvider>
      </body>
    </html>
  );
}
