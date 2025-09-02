import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    outDir: "../wysiwyg/public/scripts", // thư mục đích
    emptyOutDir: true, // xóa folder trước khi build
    target: "esnext",
    rollupOptions: {
      input: path.resolve(__dirname, "scripts/main.ts"), // entry TS
      output: {
        entryFileNames: "[name].js", // tên file JS output
        chunkFileNames: "[name]-[hash].js",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "scripts"), // hoặc "src" tùy theo cấu trúc project của bạn
    },
  },
})
