import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Qulaynavbat — Navbat kutishni unuting!";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const iconData = await readFile(join(process.cwd(), "public", "icon-mark.png"));
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          backgroundColor: "#f5efe2",
          backgroundImage:
            "radial-gradient(circle at 12% 15%, rgba(20,94,229,0.28), transparent 45%), radial-gradient(circle at 88% 85%, rgba(4,20,73,0.22), transparent 45%), radial-gradient(circle at 90% 10%, rgba(174,199,232,0.35), transparent 40%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconSrc} width={72} height={70} alt="" />
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>
            <span style={{ color: "#145ee5" }}>Qulay</span>
            <span style={{ color: "#041449" }}>navbat</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            color: "#2a2420",
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          Navbat kutishni unuting!
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#7c7264",
            textAlign: "center",
            maxWidth: 760,
          }}
        >
          Usta yoki salonni toping va bir necha soniyada joy band qiling
        </div>
      </div>
    ),
    { ...size }
  );
}
