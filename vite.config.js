import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "click.mp3", "delete.wav", "time.png", "deadline.png"],
      manifest: {
        name: "Clicker Timer",
        short_name: "Timer",
        start_url: "/",
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
