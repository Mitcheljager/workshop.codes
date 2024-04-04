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
      "@scss": resolve(__dirname, "app/javascript/scss"),
      "@images": resolve(__dirname, "app/javascript/images"),
      "@fonts": resolve(__dirname, "app/javascript/fonts"),
      "@test": resolve(__dirname, "app/javascript/test"),
      "@src": resolve(__dirname, "app/javascript/src"),
      "@components": resolve(__dirname, "app/javascript/src/components"),
      "@constants": resolve(__dirname, "app/javascript/src/constants"),
      "@lib": resolve(__dirname, "app/javascript/src/lib"),
      "@utils": resolve(__dirname, "app/javascript/src/utils")
    }
  }
})
