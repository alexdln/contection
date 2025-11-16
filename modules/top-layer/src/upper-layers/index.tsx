"use client";

import { type StoreInstance } from "contection/dist/types";
import React from "react";

import { type TopLayerStore } from "../types";
import { UpperLayerContext } from "./contexts";

export interface UpperLayerProps extends React.HTMLAttributes<HTMLDialogElement> {
    children: React.ReactNode;
}

export const UpperLayer =
    <Store extends TopLayerStore>({
        index,
        context: Context = UpperLayerContext,
    }: {
        context?: React.Context<{ index?: string }>;
        instance: Pick<StoreInstance<Store>, "_context" | "_initial">;
        index: string;
    }) =>
    ({ children }: UpperLayerProps) => {
        return <Context.Provider value={{ index }}>{children}</Context.Provider>;
    };
