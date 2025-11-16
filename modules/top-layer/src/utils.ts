import { type StoreInstance } from "contection/dist/types";

import {
    type TopLayerStore,
    type Configuration,
    type UpperLayer as UpperLayerType,
    type Dialog as DialogType,
} from "./types";
import { UpperLayerContext } from "./upper-layers/contexts";
import { UpperLayerConsumer } from "./upper-layers/consumer";
import { UpperLayer } from "./upper-layers";
import { DialogWrapperContext } from "./dialogs/contexts";
import { DialogConsumer } from "./dialogs/consumer";
import { Dialog } from "./dialogs";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const createDialogInstance = <Data extends unknown = unknown>(
    instance: Pick<StoreInstance<TopLayerStore>, "_context" | "_initial">,
    key: string,
    value: Data,
) => {
    const id = `dialog_${key}`;
    const TopLayerDialog = Dialog({ instance, id, context: DialogWrapperContext });
    const TopLayerDialogConsumer = DialogConsumer({ _instance: instance, _id: id, _initial: value });
    return [
        key,
        Object.assign(TopLayerDialog, {
            Dialog: TopLayerDialog,
            Consumer: TopLayerDialogConsumer,
            _instance: instance,
            _context: DialogWrapperContext,
            _initial: value,
            _id: id,
            $$typeof: Symbol.for("contection.dialog"),
        }),
    ] as const;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const createUpperLayerInstance = <Data extends unknown = unknown>(
    instance: Pick<StoreInstance<TopLayerStore>, "_context" | "_initial">,
    key: string,
    value: Data,
) => {
    const id = `upperLayer_${key}`;
    const TopLayerUpperLayer = UpperLayer({ id, context: UpperLayerContext });
    const TopLayerUpperLayerConsumer = UpperLayerConsumer({
        _instance: instance,
        _id: id,
        _initial: value,
    });
    return [
        key,
        Object.assign(TopLayerUpperLayer, {
            UpperLayer: TopLayerUpperLayer,
            Consumer: TopLayerUpperLayerConsumer,
            _instance: instance,
            _context: UpperLayerContext,
            _initial: value,
            _id: id,
            $$typeof: Symbol.for("contection.upperLayer"),
        }),
    ] as const;
};

export const formatStore = (configuration: Configuration) => {
    const { dialogs, upperLayers } = configuration;
    const formattedDialogs = Object.entries(dialogs ?? {}).map(
        ([key, value]) =>
            [
                `dialog_${key}`,
                {
                    checkIsActive: value.checkIsActive ?? ((store) => store.open),
                    data: value.data ?? undefined,
                    isolated: value.isolated ?? false,
                    node: null,
                    open: false,
                    type: "dialog",
                },
            ] as [string, DialogType],
    );
    const formattedUpperLayers = Object.entries(upperLayers ?? {}).map(
        ([key, value]) =>
            [
                `upperLayer_${key}`,
                {
                    checkIsActive: value.checkIsActive ?? ((store) => store.data),
                    data: value.data ?? undefined,
                    isolated: value.isolated ?? false,
                    type: "upperLayer",
                },
            ] as [string, UpperLayerType],
    );
    return Object.fromEntries([...formattedDialogs, ...formattedUpperLayers]);
};
