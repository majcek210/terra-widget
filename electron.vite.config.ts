import { resolve } from "node:path"
import { defineConfig } from "electron-vite"
export default defineConfig( {
  main: {
    // vite config options
  },
  preload: {
    // vite config options
  },
  renderer: {
    build: {
      rolldownOptions: {
        input: {index: resolve("src/renderer/index.html"), settings: resolve("src/renderer/settings.html")}
      }
    }
  }
})