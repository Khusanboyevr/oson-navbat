import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "osonNavbat — Navbat kutishni unuting!";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={480} height={155} alt="osonNavbat" />
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
