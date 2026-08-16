import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qulaynavbat — Navbat kutishni unuting!",
    short_name: "Qulaynavbat",
    description: "O'zingizga yoqqan usta yoki salonni toping va bir necha soniyada joy band qiling.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe2",
    theme_color: "#145ee5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
