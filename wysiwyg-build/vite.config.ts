import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    outDir: "../wysiwyg/public/scripts", // thư mục đích
    sourcemap: true,
    emptyOutDir: true, // xóa folder trước khi build
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      input: path.resolve(__dirname, "scripts/main.ts"), // entry TS
      output: {
        entryFileNames: "[name].js", // tên file JS output
        chunkFileNames: "[name]-[hash].js",
        // Tách riêng CodeMirror core và các ngôn ngữ
        manualChunks: {
          codemirror: [
            "@codemirror/state",
            "@codemirror/view",
            "@codemirror/language",
            "@codemirror/commands",
            "@codemirror/autocomplete",
            "@codemirror/lint",
          ],
          "codemirror-langs": ["@codemirror/lang-javascript", "@codemirror/lang-cpp", "@codemirror/lang-python"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "scripts"), // hoặc "src" tùy theo cấu trúc project của bạn
    },
  },
})
