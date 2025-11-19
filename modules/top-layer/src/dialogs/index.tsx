"use client";

import React, { useCallback } from "react";
import { type StoreInstance, useStoreReducer } from "contection";

import { type Dialog as DialogType, type TopLayerStore } from "../types";
import { DialogWrapperContext } from "./contexts";

export interface DialogProps
    extends React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement> {
    children: React.ReactNode;
}

export const Dialog =
    ({
        instance,
        id,
        context: Context = DialogWrapperContext,
    }: {
        instance: Pick<StoreInstance<TopLayerStore>, "_context">;
        id: string;
        context?: React.Context<{ id?: string }>;
    }) =>
    ({ children, onClose, ...props }: DialogProps) => {
        const [store, setStore, subscribe] = useStoreReducer(instance);

        const registerDialog = useCallback((node: HTMLDialogElement | null) => {
            if (!node || !store[id]) return;
            const dialogStore = store[id] as DialogType;

            if (dialogStore.open) {
                node.showModal();
            } else if (node.open) {
                node.close();
            }
            setStore((prev) => {
                (prev[id] as DialogType).node = node;

                return prev;
            });

            return subscribe(id, (newDialog) => {
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

                const dialogStore = store[id] as DialogType;
                setStore({
                    [id]: { ...dialogStore, open: false },
                });
            },
            [onClose],
        );

        return (
            <Context.Provider value={{ id }}>
                <dialog onClose={closeHandler} ref={registerDialog} {...props}>
                    {children}
                </dialog>
            </Context.Provider>
        );
    };
