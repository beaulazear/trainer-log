import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  // SPA mode is required for GitHub Pages static hosting
  ssr: false,
  // Use basename only for production (GitHub Pages)
  basename: process.env.NODE_ENV === 'production' ? "/trainer-log" : "/",
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
} satisfies Config;
