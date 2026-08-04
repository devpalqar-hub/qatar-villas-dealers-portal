import {NextIntlClientProvider} from "next-intl";
import {getLocale, getMessages} from "next-intl/server";
import type {Metadata} from "next";
import {Cairo, Inter} from "next/font/google";
import "leaflet/dist/leaflet.css";
import {isRtlLocale} from "@/i18n/config";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"]
});

export const metadata: Metadata = {
  title: "Villas Qatar Dealers Portal",
  description: "Bilingual dealer portal for managing Qatar property listings."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRtl = isRtlLocale(locale);

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${inter.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`min-h-full flex flex-col ${isRtl ? cairo.className : inter.className}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
