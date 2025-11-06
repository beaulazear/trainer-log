import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Set base path for GitHub Pages deployment
  base: '/trainer-log/',
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
