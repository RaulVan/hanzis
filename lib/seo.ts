import type { Metadata } from "next";

export const SITE_URL = "https://hanzis.com";
export const SITE_NAME = "汉字网 Hanzis";

/** All public pages use the same origin and trailing-slash URL convention. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, SITE_URL).href;
  const shareTitle = `${title} | ${SITE_NAME}`;
  return {
    // The root page does not inherit the root layout's title template.
    title: { absolute: shareTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: shareTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
    },
    twitter: { card: "summary", title: shareTitle, description },
  };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
