import { type Metadata } from "next/types";

import { ReactQueryProvider } from "@/src/providers/react-query/provider";
import { AppStoreProvider } from "@/src/providers/app-store/provider";
import { themeScript } from "@/src/lib/scripts";

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
            </body>
        </html>
    );
};

export default RootLayout;
