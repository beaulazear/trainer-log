import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  // Set base path for GitHub Pages deployment (only in production)
  base: mode === 'production' ? '/trainer-log/' : '/',
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
}));
