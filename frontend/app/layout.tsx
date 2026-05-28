import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://veda-ai.com"),
  title: "VedaAI | AI-Powered Academic & Personalised Learning System",
  description:
    "VedaAI is a revolutionary AI-powered academic system designed for modern assessment, smart teaching, and personalized learning pathways.",
  keywords: [
    "VedaAI",
    "AI Education",
    "Smart Assessments",
    "Personalized Learning",
    "AI Grading Assistant",
    "EdTech Platform",
    "Automated Assessments",
    "Teacher AI Toolkit",
  ],
  authors: [{ name: "VedaAI Team" }],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "VedaAI | AI-Powered Academic & Personalised Learning System",
    description:
      "Create smart assessments, automate grading, and personalize learning paths with VedaAI.",
    url: "https://veda-ai.com",
    siteName: "VedaAI",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "VedaAI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "VedaAI | AI-Powered Academic & Personalised Learning System",
    description:
      "Create smart assessments, automate grading, and personalize learning paths with VedaAI.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", bricolageGrotesque.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
