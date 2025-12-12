import { defineConfig } from "vite";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";
import tsconfigPaths from "vite-tsconfig-paths";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
    plugins: [tsconfigPaths(), reactRouterRSC(), rsc(), devtoolsJson()],
    optimizeDeps: {
        include: ["react-router/dom"],
    },
});
