import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import vike from 'vike/plugin'
import { cloudflare } from '@cloudflare/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools({
    //   launchEditor: 'codium'
    // }),
    
    cloudflare({
      viteEnvironment: {name: 'ssr'},
    }),
    vike(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,ttf}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: (options) => [
              '/game-assets/game_version.json',
              '/game-assets/game_objects.json',
              '/game-assets/group_quests.json',
              '/game-assets/fortune_shop.json',
            ].includes(options.url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'game-data-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: (options) => options.url.pathname.startsWith('/game-assets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-assets-cache',
              expiration: {
                maxEntries: 600,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      manifest: {
        id: "/",
        start_url: "/",
        display: "minimal-ui",
        name: "MLP CHECK",
        scope: "/",
        short_name: "MLP CHECK",
        theme_color: "#ff6b9b",
        background_color: "#e1f2faff",
        description: "MLP: Magic Princess — справочник и личный чек-лист пони",
        shortcuts: [
          {
            name: "Ponies",
            url: "/search/ponies",
            description: "Search all the ponies in the game"
          },
          {
            name: "Inventory",
            url: "/inventory",
            description: "View your inventory"
          },
          {
            name: "Who's That Pony?",
            url: "/guesser",
            description: "Guess the pony from the silhouette"
          }
        ],
        categories: [
          "entertainment",
          "games",
          "reference"
        ],
        icons: [
          { src: "/favicon/mlp-check-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/favicon/mlp-check-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    port: 5000,
  },
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().valueOf()),
    __BASE_URL__: JSON.stringify("https://all-the-pony-personal.mistik31-kris.workers.dev/"),
  }
})
