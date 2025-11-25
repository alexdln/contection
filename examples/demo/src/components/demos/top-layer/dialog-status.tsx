import { useDialogStore } from "contection-top-layer";

import { Dialogs } from "../../../stores/top-layer-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const DialogStatus: React.FC = () => {
    const confirmDialog = useDialogStore(Dialogs.ConfirmDialog);
    const settingsDialog = useDialogStore(Dialogs.SettingsDialog);

    return (
        <RenderTracker path="/components/demos/top-layer/dialog-status.tsx" color="#ef4444">
            <Card title="Dialog Status" description="Re-renders when dialog state changes">
                <div className="demo-top-layer__card-content">
                    <div>
                        Confirm Dialog: <strong>{confirmDialog.open ? "Open" : "Closed"}</strong>
                    </div>
                    <div>
                        Settings Dialog: <strong>{settingsDialog.open ? "Open" : "Closed"}</strong>
                    </div>
                </div>
            </Card>
        </RenderTracker>
    );
};
