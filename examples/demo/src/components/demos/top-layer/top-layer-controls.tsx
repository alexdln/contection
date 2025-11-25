import { useDialogReducer, useUpperLayerReducer } from "contection-top-layer";

import { Dialogs, UpperLayers } from "../../../stores/top-layer-store";
import { Button } from "../../ui/button";

import "./styles.scss";

export const TopLayerControls: React.FC = () => {
    const [, setConfirmDialog] = useDialogReducer(Dialogs.ConfirmDialog);
    const [, setSettingsDialog] = useDialogReducer(Dialogs.SettingsDialog);
    const [, setNotification] = useUpperLayerReducer(UpperLayers.NotificationLayer);
    const [, setTooltip] = useUpperLayerReducer(UpperLayers.TooltipLayer);

    return (
        <div className="demo-top-layer__controls">
            <Button
                onClick={() =>
                    setConfirmDialog({
                        open: true,
                        data: {
                            title: "Confirm Action",
                            message: "Are you sure you want to proceed?",
                            onConfirm: () => {
                                setConfirmDialog((prev) => ({ ...prev, open: false }));
                                alert("Confirmed!");
                            },
                            onCancel: () => {
                                setConfirmDialog((prev) => ({ ...prev, open: false }));
                            },
                        },
                    })
                }
            >
                Open Confirm
            </Button>
            <Button
                onClick={() =>
                    setSettingsDialog({
                        open: true,
                        data: { section: "general" },
                    })
                }
            >
                Open Settings
            </Button>
            <Button
                onClick={() =>
                    setNotification((prev) => ({
                        data: prev.data
                            ? null
                            : {
                                  id: Math.random().toString(),
                                  message: `Notification message`,
                                  type: (["info", "success", "warning", "error"] as const)[
                                      Math.floor(Math.random() * 3)
                                  ],
                              },
                    }))
                }
            >
                Notification
            </Button>
            <Button
                onClick={(e) =>
                    setTooltip((prev) => ({
                        data: prev.data
                            ? null
                            : {
                                  content: "This is a tooltip!",
                                  x: e.clientX,
                                  y: e.clientY,
                              },
                    }))
                }
            >
                Tooltip
            </Button>
        </div>
    );
};
