import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  // SPA mode is required for GitHub Pages static hosting
  ssr: false,
  basename: "/trainer-log",
} satisfies Config;
