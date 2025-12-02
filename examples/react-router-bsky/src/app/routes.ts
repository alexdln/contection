import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("./page.tsx"), route("/api/feed", "./api/feed/route.tsx")] satisfies RouteConfig;
