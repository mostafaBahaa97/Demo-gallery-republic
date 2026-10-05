import type { Metadata } from "next";
import { ToastProvider } from "@/hooks/useToast";
import { THEME_MODE } from "@/lib/config";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Gallery Republic | إكسسوارات نسائية فاخرة",
  description:
    "Gallery Republic — مجموعة مُنتقاة من الإكسسوارات الفاخرة. توصيل لكل محافظات مصر، الدفع عند الاستلام.",
  icons: { icon: "/logo.png" },
};

// خطوط الثيم الفرعوني (Cinzel للاتيني + Reem Kufi للعناوين العربي) بتتحمّل
// بس لما THEME_MODE = "pharaonic"، وإلا بيفضل نفس خط الثيم الأصلي (Amiri/Fraunces).
const FONTS_HREF =
  THEME_MODE === "pharaonic"
    ? "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Reem+Kufi:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
    : "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500;1,9..144,600&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router layout head, not pages/_document */}
        <link href={FONTS_HREF} rel="stylesheet" />
        <Analytics />
      </head>
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
