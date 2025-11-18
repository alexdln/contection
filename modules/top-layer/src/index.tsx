import { createStore } from "contection";
import React from "react";

import { type TopLayerStore, type ConfigurationDialogLayer, type ConfigurationUpperLayerLayer } from "./types";
import { createDialogInstance, createUpperLayerInstance, formatStore } from "./utils";

export const createTopLayer = <
    Dialogs extends { [Key in keyof Dialogs]: ConfigurationDialogLayer<Dialogs[Key]["data"]> },
    UpperLayers extends { [Key in keyof UpperLayers]: ConfigurationUpperLayerLayer<UpperLayers[Key]["data"]> },
>(
    configuration: { dialogs?: Dialogs; upperLayers?: UpperLayers },
    options?: Parameters<typeof createStore<TopLayerStore>>[1],
) => {
    const { dialogs, upperLayers } = configuration;
    const initialState: TopLayerStore = formatStore(configuration);
    const Store = createStore<TopLayerStore>(initialState, options);

    const Provider = ({ children }: { children: React.ReactNode }) => {
        return <StoreProvider>{children}</StoreProvider>;
    };

    const { Provider: StoreProvider, $$typeof, _context, _initial, displayName } = Store;
    const TopLayerStore = Object.assign(Provider, {
        Provider,
        $$typeof,
        _context,
        _initial: new Proxy(_initial, {
            get(target, prop) {
                return target[prop as keyof typeof target];
            },
        }),
        displayName,
    });

    const Dialogs = Object.fromEntries(
        Object.entries(dialogs ?? {}).map(([key, value]) => createDialogInstance(TopLayerStore, key, value)),
    ) as { [Key in keyof Dialogs]: ReturnType<typeof createDialogInstance<Dialogs[Key]["data"]>>[1] };

    const UpperLayers = Object.fromEntries(
        Object.entries(upperLayers ?? {}).map(([key, value]) => createUpperLayerInstance(TopLayerStore, key, value)),
    ) as { [Key in keyof UpperLayers]: ReturnType<typeof createUpperLayerInstance<UpperLayers[Key]["data"]>>[1] };

    return { TopLayerStore, Dialogs, UpperLayers };
};

export * from "./hooks";
export * from "./dialogs/hooks";
export * from "./upper-layers/hooks";
