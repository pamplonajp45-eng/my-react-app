import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Set base path for GitHub Pages
  base: "/my-react-app/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "click.mp3", "delete.wav", "time.png", "deadline.png"],
      manifest: {
        name: "Clicker Timer",
        short_name: "JPDEV Timer",
        start_url: "/my-react-app/", // Correct path for GitHub Pages
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#317EFB",
        icons: [
          {
            src: "time.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "deadline.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
