import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        mesh: resolve(__dirname, "mesh.html"),
        field: resolve(__dirname, "field.html"),
      },
    },
  },
});
