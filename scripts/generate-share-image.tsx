// Run with: npx tsx scripts/generate-share-image.tsx
// Static PNG: no runtime image service or remote font requests.
import React from "react";
import { writeFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

async function main() {
  const response = new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#F8F7F4", color: "#292C26" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <svg width="100" height="100" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14" fill="#B44335" />
          <path d="M14 14h36v36H14zM32 14v36M14 32h36" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="m17 17 30 30m0-30L17 47" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" opacity=".55" />
        </svg>
        <span style={{ fontSize: 88, fontWeight: 700 }}>Hanzis</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 52 }}>Learn Chinese, one stroke at a time.</span>
        <span style={{ fontSize: 28, color: "#62685E" }}>Worksheets · Pinyin · Stroke order · Poetry · Dictionary</span>
      </div>
      <div style={{ display: "flex", borderTop: "2px solid #D9DDD3", paddingTop: 24, fontSize: 26, color: "#B44335" }}>hanzis.com</div>
    </div>,
    { width: 1200, height: 630 },
  );
  await writeFile(new URL("../public/social-card.png", import.meta.url), Buffer.from(await response.arrayBuffer()));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
