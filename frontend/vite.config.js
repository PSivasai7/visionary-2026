import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // You might need to import path

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // This forces the app to use the version of React in your root node_modules
      react: path.resolve("./node_modules/react"),
    },
  },
});
