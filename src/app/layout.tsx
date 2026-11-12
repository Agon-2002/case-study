import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Providers } from "./Providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Image Comments",
  robots: { index: false },
};

// The canvas handles pinch zoom itself, so the browser must not zoom the page.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>
          <Providers>
            <Suspense>{children}</Suspense>
          </Providers>
        </TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
