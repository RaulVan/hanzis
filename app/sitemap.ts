import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { poems } from "@/data/poems";

const routes = ["", "/pinyin", "/pinyin/initials", "/pinyin/finals", "/pinyin/syllables", "/pinyin/tones", "/pinyin/practice", "/stroke", "/poetry", "/dictionary", "/games", "/games/hanzi-match", "/games/pinyin-quiz", "/games/feihua", "/about", "/privacy"];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    ...routes.map((route, index) => ({ url: `${base}${route}/`, changeFrequency: index === 0 ? "weekly" as const : "monthly" as const, priority: index === 0 ? 1 : route === "/about" || route === "/privacy" ? 0.3 : 0.8 })),
    ...poems.map(poem => ({ url: `${base}/poetry/${poem.slug}/`, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
