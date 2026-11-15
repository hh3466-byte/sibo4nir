import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { defaultLocale, getDirection } from "@/lib/i18n";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "Take Me Out",
  description: "השכרת סירות ויאכטות ביוון – בעברית",
  applicationName: "Take Me Out",
};

export const viewport: Viewport = {
  themeColor: "#0b4f71",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={defaultLocale}
      dir={getDirection(defaultLocale)}
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
