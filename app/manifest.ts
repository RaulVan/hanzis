import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "汉字网 Hanzis",
    short_name: "汉字网",
    description: "字帖生成、拼音学习、汉字笔顺、古诗词与中文字典。",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7F4",
    theme_color: "#B44335",
    lang: "zh-CN",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
