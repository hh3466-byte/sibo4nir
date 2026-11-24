import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import { defaultLocale, getDirection } from "@/lib/i18n";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const frank = Frank_Ruhl_Libre({
  variable: "--font-frank",
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Take Me Out",
  description: "השכרת סירות ויאכטות ביוון – בעברית",
  applicationName: "Take Me Out",
};

export const viewport: Viewport = {
  themeColor: "#0b1e28",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={defaultLocale}
      dir={getDirection(defaultLocale)}
      className={`${heebo.variable} ${frank.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
