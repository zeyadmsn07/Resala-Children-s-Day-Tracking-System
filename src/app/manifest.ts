import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Children's Day",
    short_name: "Tracking",
    description: "Every child. Every session. Every step forward.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#253487",
    icons: [
      {
        src: "/resala-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/resala-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
