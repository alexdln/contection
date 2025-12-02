"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export interface ReactQueryProviderProps {
    children: ReactNode;
}

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
