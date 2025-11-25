import { createTopLayer } from "contection-top-layer";

export const { TopLayerStore, Dialogs, UpperLayers } = createTopLayer({
    dialogs: {
        ConfirmDialog: {
            data: {
                title: "",
                message: "",
                onConfirm: () => {},
                onCancel: () => {},
            },
            isolated: true,
        },
        SettingsDialog: {
            data: {
                section: "general" as "general" | "appearance" | "notifications",
            },
            isolated: true,
        },
    },
    upperLayers: {
        NotificationLayer: {
            data: null as { id: string; message: string; type: "info" | "success" | "warning" | "error" } | null,
        },
        TooltipLayer: {
            data: null as { content: string; x: number; y: number } | null,
        },
    },
});
