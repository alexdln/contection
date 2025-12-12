import { Links, Meta, Outlet, ScrollRestoration } from "react-router";

import { ReactQueryProvider } from "@/src/providers/react-query/provider";
import { AppStoreProvider } from "@/src/providers/app-store/provider";
import { themeScript } from "@/src/lib/scripts";
import { CacheWidget } from "@nimpl/cache-widget";

import "@nimpl/cache-widget/styles.css";
import "./globals.css";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <html lang="en" data-theme="light" data-theme-mode="system" suppressHydrationWarning>
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
            <script
                dangerouslySetInnerHTML={{
                    __html: themeScript,
                }}
            />
        </head>
        <body>
            {children}
            {/*
                This is solely for cacheComponents support in Vercel, if you are self-hosting
                you can remove these lines and the cache-handler file
            */}
            {(import.meta.env.REDIS_URL || import.meta.env.VITE_REDIS_STORE === "true") && <CacheWidget />}
            <ScrollRestoration />
        </body>
    </html>
);

const Root: React.FC = () => (
    <AppStoreProvider>
        <ReactQueryProvider>
            <Outlet />
        </ReactQueryProvider>
    </AppStoreProvider>
);

export default Root;
