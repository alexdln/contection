import { type Metadata } from "next/types";

import { ReactQueryProvider } from "@/providers/react-query/provider";
import { AppStoreProvider } from "@/providers/app-store/provider";

import "./globals.css";

export const metadata: Metadata = {
    title: "Bluesky Feeds - Contection Example",
    description: "Example Next.js app using Contection with Bluesky feeds",
};

export interface RootLayoutProps {
    children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="en" data-theme="light" data-theme-mode="system" suppressHydrationWarning>
            <body>
                <script>
                    {`(() => {
                    if (localStorage.getItem("__ctn_theme")) {
                        const theme = localStorage.getItem("__ctn_theme")?.replace(/"|%22/g, "").trim();
                        if (theme === "light" || theme === "dark") {
                            document.documentElement.dataset.theme = theme;
                            document.documentElement.dataset.themeMode = theme;
                            return
                        }
                    }
                    document.documentElement.dataset.themeMode = "system";
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                        document.documentElement.dataset.theme = "dark";
                    }
                })()`}
                </script>
                <AppStoreProvider>
                    <ReactQueryProvider>{children}</ReactQueryProvider>
                </AppStoreProvider>
            </body>
        </html>
    );
};

export default RootLayout;
