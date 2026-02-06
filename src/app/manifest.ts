import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elivate Cleaning Crew Tracker",
    short_name: "CleanTrack",
    description: "Cleaner check-in and tracking web app.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F0F0F",
    theme_color: "#0F0F0F",
    icons: [
      {
        src: "/Elivate Network Logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/Elivate Network Logo.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
