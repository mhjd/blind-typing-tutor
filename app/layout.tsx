import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { headers } from "next/headers";
import { INTERFACE_LANGUAGE_OPTIONS } from "@/config/constants";
import { getTextDirection, getLanguageTag } from "@/utils/textDirection";
import type { InterfaceLanguage } from "@/translations";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apprendre le clavier",
  description: "Entraînement au clavier, à votre rythme, sans télémétrie.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Extract interface language from URL path
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Parse interface language from path (format: /[interfaceLang]/...)
  const pathSegments = pathname.split("/").filter(Boolean);
  const interfaceLangCode = pathSegments[0] || "fr";

  // Validate interface language
  const validLang = INTERFACE_LANGUAGE_OPTIONS.find(
    (opt) => opt.code === interfaceLangCode,
  );
  const validatedLang = (
    validLang ? interfaceLangCode : "fr"
  ) as InterfaceLanguage;

  // Get language attributes
  const lang = getLanguageTag(validatedLang);
  const dir = getTextDirection(validatedLang);

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flicker - runs before any content renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var darkMode = localStorage.getItem('darkMode');
                  if (darkMode === 'true' || (darkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
