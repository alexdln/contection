"use client";

import React from "react";

import { UpperLayerContext } from "./contexts";

export interface UpperLayerProps extends React.HTMLAttributes<HTMLDialogElement> {
    children: React.ReactNode;
}

export const UpperLayer =
    ({ id, context: Context = UpperLayerContext }: { context?: React.Context<{ id?: string }>; id: string }) =>
    ({ children }: UpperLayerProps) => {
        return <Context.Provider value={{ id }}>{children}</Context.Provider>;
    };
