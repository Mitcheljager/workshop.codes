import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { resolve } from "path"
import RubyPlugin from "vite-plugin-ruby"
import FullReload from "vite-plugin-full-reload"
import sassGlobImports from "vite-plugin-sass-glob-import"

export default defineConfig({
  css: {
    devSourcemap: true
  },
  plugins: [
    RubyPlugin(),
    FullReload(["config/routes.rb", "app/views/**/*"]),
    svelte(),
    sassGlobImports()
  ],
  resolve: {
    alias: {
      "@scss": resolve(__dirname, "app/javascript/scss")
    }
  }
})
