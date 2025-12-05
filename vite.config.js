import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/my-react-app/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "click.mp3", "delete.wav", "reminder.mp3", "time.png"],
      manifest: {
        name: "G?",
        short_name: "G!",
        description: "Small steps lead to big wins — add your first task.",
        start_url: "/my-react-app/",
        display: "standalone",
        background_color: "#0f2027",
        theme_color: "#0f2027",
        orientation: "portrait",
        lang: "en",
        scope: "/my-react-app/",
        icons: [
          {
            src: "/my-react-app/time.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/my-react-app/time.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
});