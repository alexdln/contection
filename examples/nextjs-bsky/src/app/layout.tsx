import { type Metadata } from "next/types";
import { CacheWidget } from "@nimpl/cache-widget/widget";

import { ReactQueryProvider } from "@/src/providers/react-query/provider";
import { AppStoreProvider } from "@/src/providers/app-store/provider";
import { themeScript } from "@/src/lib/scripts";

import "@nimpl/cache-widget/styles.css";
import "./globals.css";

export const metadata: Metadata = {
    title: "Bluesky Feeds | Next.js CacheComponents | Contection Example",
    description: "Example Next.js app using Contection with Bluesky feeds",
};

export interface RootLayoutProps {
    children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="en" data-theme="light" data-theme-mode="system" suppressHydrationWarning>
            <body>
                <script
                    dangerouslySetInnerHTML={{
                        __html: themeScript,
                    }}
                />
                <AppStoreProvider>
                    <ReactQueryProvider>{children}</ReactQueryProvider>
                </AppStoreProvider>
                {/*
                    This is solely for cacheComponents support in Vercel, if you are self-hosting
                    you can remove these lines and the cache-handler file
                */}
                {(process.env.REDIS_URL || process.env.REDIS_STORE === "true") && <CacheWidget />}
            </body>
        </html>
    );
};

export default RootLayout;
