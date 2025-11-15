"use client";

import React, { useCallback } from "react";
import { type StoreInstance } from "contection/dist/types";
import { useStoreReducer } from "contection";

import { type Dialog as DialogType, type TopLayerStore } from "../types";
import { DialogWrapperContext } from "./contexts";

export interface DialogProps
    extends React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement> {
    children: React.ReactNode;
}

export const Dialog =
    <Store extends TopLayerStore>({
        instance,
        index,
        context: Context = DialogWrapperContext,
    }: {
        instance: Pick<StoreInstance<Store>, "_context" | "_initial">;
        index: string;
        context?: React.Context<{ index?: string }>;
    }) =>
    ({ children, onClose, ...props }: DialogProps) => {
        const [store, dispatch, listen] = useStoreReducer(instance);

        const registerDialog = useCallback((node: HTMLDialogElement | null) => {
            if (!node) return;
            const dialogStore = store[index] as DialogType;

            if (dialogStore.open) {
                node.showModal();
            } else if (node.open) {
                node.close();
            }
            dispatch((prev) => {
                (prev[index] as DialogType).node = node;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return prev as any;
            });

            return listen(String(index) as keyof Store, (newDialog) => {
                if ((newDialog as DialogType).open) {
                    node.showModal();
                } else if (node.open) {
                    node.close();
                }
            });
        }, []);

        const closeHandler = useCallback(
            (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
                onClose?.(e);

                if (e.defaultPrevented) return;

                const dialogStore = store[index] as DialogType;
                dispatch({
                    [index]: { ...dialogStore, open: false },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any);
            },
            [onClose],
        );

        return (
            <Context.Provider value={{ index }}>
                <dialog onClose={closeHandler} ref={registerDialog} {...props}>
                    {children}
                </dialog>
            </Context.Provider>
        );
    };
