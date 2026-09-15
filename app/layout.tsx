import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import HydrationGate from "@/components/layout/HydrationGate";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viet Golf — Đặt sân golf tại Việt Nam",
  description:
    "Tìm và đặt giờ phát bóng tại các sân golf hàng đầu quanh TP. Hồ Chí Minh.",
  applicationName: "Viet Golf",
  appleWebApp: {
    capable: true,
    title: "Viet Golf",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Viet Golf — Đặt sân golf tại Việt Nam",
    description:
      "Tìm và đặt giờ phát bóng tại các sân golf hàng đầu quanh TP. Hồ Chí Minh.",
    siteName: "Viet Golf",
    locale: "vi_VN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#090C0A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <div className="app-shell pb-[76px]">
          <HydrationGate>{children}</HydrationGate>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
