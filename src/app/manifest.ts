import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mersul Trenurilor la Zi",
    short_name: "MT la Zi",
    description: "Orar trenuri, întârzieri și bilete în România.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0B5FFF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
