import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { getPublicConfig } from "@/lib/config";
import { PixelEvents } from "@/components/PixelEvents";

const publicConfig = getPublicConfig();
const siteUrl = publicConfig.siteUrl;
const ogImage = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Виставка інструментів LDVIR.UA — 15 липня 2026, Хмельницький",
  description:
    "15 липня 2026 у Хмельницькому відбудеться виставка інструментів LDVIR.UA. DeWalt, Milwaukee, Makita, Metabo, Maruyama, DISTAR, Paton, GTM.",
  openGraph: {
    title: "Виставка інструментів LDVIR.UA",
    description:
      "15 липня 2026, Хмельницький, вул. Вінницька 1/9. Тестуй. Порівнюй. Обирай краще.",
    url: siteUrl,
    siteName: "LDVIR.UA",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Виставка інструментів LDVIR.UA",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Виставка інструментів LDVIR.UA",
    description:
      "15 липня 2026, Хмельницький, вул. Вінницька 1/9. Тестуй. Порівнюй. Обирай краще.",
    images: [ogImage],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-ldvir.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1C1C1C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelId = publicConfig.metaPixelId;
  const gaId = publicConfig.gaId;

  return (
    <html lang="uk">
      <body>
        {pixelId ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        <PixelEvents />
        {children}
      </body>
    </html>
  );
}
