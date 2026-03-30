/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { type StoreInstance } from "contection";

export type InheritedStore<Store extends TopLayerStore> = {
    _instance: Pick<StoreInstance<Store>, "_context" | "_initial">;
};

export type CheckIsActive<ItemData extends unknown = unknown> = (
    data: Omit<ItemData, "checkIsActive" | "type">,
) => boolean;

export type DialogType<Data extends unknown = unknown> = {
    isolated: boolean;
    open: boolean;
    data: Data;
    node: HTMLDialogElement | null;
    checkIsActive: CheckIsActive<DialogType<Data>>;
    type: "dialog";
};

export type UpperLayerType<Data extends unknown = unknown> = {
    isolated: boolean;
    data?: Data;
    checkIsActive: CheckIsActive<UpperLayerType<Data>>;
    type: "upperLayer";
};

export type ConfigurationDialogLayer<Data extends unknown = unknown> = {
    isolated?: boolean;
    data?: Data;
    checkIsActive?: CheckIsActive<DialogType<Data>>;
};

export type ConfigurationUpperLayerLayer<Data extends unknown = unknown> = {
    isolated?: boolean;
    data?: Data;
    checkIsActive?: CheckIsActive<UpperLayerType<Data>>;
};

export type Configuration<
    DialogData extends { [Key in keyof DialogData]: ConfigurationDialogLayer<DialogData[Key]["data"]> } = {
        [Key: string]: ConfigurationDialogLayer;
    },
    UpperLayerData extends {
        [Key in keyof UpperLayerData]: ConfigurationUpperLayerLayer<UpperLayerData[Key]["data"]>;
    } = { [Key: string]: ConfigurationUpperLayerLayer },
> = {
    dialogs?: { [Key in keyof DialogData]: ConfigurationDialogLayer<DialogData[Key]["data"]> };
    upperLayers?: { [Key in keyof UpperLayerData]: ConfigurationUpperLayerLayer<UpperLayerData[Key]["data"]> };
};

export type TopLayerStore = Record<string, DialogType<unknown> | UpperLayerType<unknown>>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type NonFunction<T> = T extends Function ? never : T;

export type RegisterDialogProps<Data extends unknown = unknown> = {
    type: "dialog";
    data: Data;
    isolated: boolean;
    checkIsActive: DialogType<Data>["checkIsActive"];
};
export type RegisterUpperLayerProps<Data extends unknown = unknown> = {
    type: "upperLayer";
    data: Data;
    isolated: boolean;
    checkIsActive: UpperLayerType<Data>["checkIsActive"];
};

export type TopLayerHookStore = {
    dialogs: DialogType[];
    upperLayers: UpperLayerType[];
    hasActiveIsolatedLayers: boolean;
    hasActiveLayers: boolean;
};
