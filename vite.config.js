import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEV_API_TARGET = process.env.VITE_DEV_API_URL || "http://localhost:5050";
const USE_DEV_API_PROXY =
  String(process.env.VITE_USE_DEV_API_URL || "").toLowerCase() === "true";
const require = createRequire(import.meta.url);

const localExpressApi = () => ({
  name: "local-express-api",
  configureServer(server) {
    const app = require("./server/index.js");
    server.middlewares.use((req, res, next) => {
      const requestUrl = req.url || "";
      if (requestUrl.startsWith("/auth") || requestUrl.startsWith("/content")) {
        app(req, res, next);
        return;
      }

      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), !USE_DEV_API_PROXY && localExpressApi()],
  server: {
    ...(USE_DEV_API_PROXY
      ? {
          proxy: {
            "/auth/": DEV_API_TARGET,
            "/content/": DEV_API_TARGET,
          },
        }
      : {}),
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
});
