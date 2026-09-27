import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts: the React Router plugin is not needed for unit tests.
export default defineConfig({
  test: {
    include: ["app/**/*.test.ts"],
    environment: "node",
  },
});
