import { type Metadata } from "next/types";
import { RobinProvider, Header, Footer } from "robindoc";
import { NavigationProvider } from "@robindoc/next";

import { searchProvider } from "./search-provider";

import "robindoc/lib/styles.css";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <NavigationProvider>
                    <RobinProvider>
                        <Header
                            logo={<>Contection</>}
                            links={[
                                { href: "/docs", title: "Docs" },
                                { href: "/demo", title: "Demo" },
                            ]}
                            git="https://github.com/alexdln/contection"
                            searcher={searchProvider}
                        />
                        {children}
                        <Footer copyright="© 2026 Contection" />
                    </RobinProvider>
                </NavigationProvider>
            </body>
        </html>
    );
}

export const metadata: Metadata = {
    title: "Contection",
    description: "Contection is a library for managing state in React applications.",
};
