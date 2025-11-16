import { createStore } from "contection";
import React from "react";

import {
    type TopLayerStore,
    type Dialog as DialogType,
    type UpperLayer as UpperLayerType,
    type RegisterDialogProps,
    type RegisterUpperLayerProps,
} from "./types";
import { Dialog } from "./dialogs";
import { UpperLayer } from "./upper-layers";
import { UpperLayerContext } from "./upper-layers/contexts";
import { DialogWrapperContext } from "./dialogs/contexts";
import { DialogConsumer } from "./dialogs/consumer";
import { UpperLayerConsumer } from "./upper-layers/consumer";

const CONTECTION_SYMBOL = Symbol("contection-internal");

export const createTopLayer = (options?: Parameters<typeof createStore<TopLayerStore>>[1]) => {
    const initialState: TopLayerStore = {};
    const Store = createStore<TopLayerStore>(initialState, options);
    const { Provider: StoreProvider, $$typeof, _context, _initial, displayName } = Store;

    const Provider = ({ children }: { children: React.ReactNode }) => {
        return <StoreProvider>{children}</StoreProvider>;
    };

    return Object.assign(Provider, {
        Provider,
        $$typeof,
        _context,
        _initial: new Proxy(_initial, {
            get(target, prop) {
                return target[prop as keyof typeof target];
            },
        }),
        [CONTECTION_SYMBOL]: {
            registerDialog: <Data extends DialogType["data"]>({
                type,
                data,
                isolated,
                checkIsActive,
            }: RegisterDialogProps<Data>) => {
                const index = `dialog_${Object.keys(_initial).length}` as keyof typeof _initial;
                _initial[index] = {
                    open: false,
                    data,
                    isolated,
                    node: null,
                    type,
                    checkIsActive,
                } as DialogType<unknown>;
                return index;
            },
            registerUpperLayer: <Data extends UpperLayerType["data"]>({
                type,
                data,
                isolated,
                checkIsActive,
            }: RegisterUpperLayerProps<Data>) => {
                const index = `upperlayer_${Object.keys(_initial).length}` as keyof typeof _initial;
                _initial[index] = { data, isolated, type, checkIsActive } as UpperLayerType<unknown>;
                return index;
            },
        },
        displayName,
    });
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const createDialog = <DialogData extends unknown>({
    instance,
    data,
    isolated = false,
    checkIsActive = (store) => store.open,
}: {
    instance: ReturnType<typeof createTopLayer>;
    data: DialogType<DialogData>["data"];
    isolated?: DialogType<DialogData>["isolated"];
    checkIsActive?: DialogType<DialogData>["checkIsActive"];
}) => {
    const index = instance[CONTECTION_SYMBOL].registerDialog<DialogData>({
        type: "dialog",
        data,
        isolated,
        checkIsActive,
    });
    const TopLayerDialog = Dialog({ instance, index, context: DialogWrapperContext });
    const TopLayerDialogConsumer = DialogConsumer({ _instance: instance, _index: index, _initial: data });

    return Object.assign(TopLayerDialog, {
        Dialog: TopLayerDialog,
        Consumer: TopLayerDialogConsumer,
        _instance: instance,
        _context: DialogWrapperContext,
        _initial: data,
        _index: index,
        $$typeof: Symbol.for("contection.dialog"),
    });
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const createUpperLayer = <UpperLayerData extends unknown>({
    instance,
    data,
    isolated = false,
    checkIsActive = (store) => Boolean(store.data),
}: {
    instance: ReturnType<typeof createTopLayer>;
    data: UpperLayerData;
    isolated?: boolean;
    checkIsActive?: UpperLayerType<UpperLayerData>["checkIsActive"];
}) => {
    const index = instance[CONTECTION_SYMBOL].registerUpperLayer<UpperLayerData>({
        type: "upperLayer",
        data,
        isolated,
        checkIsActive,
    });
    const TopLayerUpperLayer = UpperLayer({ instance, index, context: UpperLayerContext });
    const TopLayerUpperLayerConsumer = UpperLayerConsumer({ _instance: instance, _index: index, _initial: data });

    return Object.assign(TopLayerUpperLayer, {
        UpperLayer: TopLayerUpperLayer,
        Consumer: TopLayerUpperLayerConsumer,
        _instance: instance,
        _context: UpperLayerContext,
        _initial: data,
        _index: index,
        $$typeof: Symbol.for("contection.upperLayer"),
    });
};
