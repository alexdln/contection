import { useDialogReducer } from "contection-top-layer";

import { Dialogs } from "../../../stores/top-layer-store";
import { Dialog } from "../../ui/dialog";

export const SettingsDialogDemo: React.FC = () => {
    const [settingsDialog, setSettingsDialog] = useDialogReducer(Dialogs.SettingsDialog);

    return (
        <Dialog
            title="Settings"
            message={`current section: ${settingsDialog.data.section}`}
            onConfirm={() => setSettingsDialog({ open: false, data: settingsDialog.data })}
            onCancel={() => setSettingsDialog({ open: false, data: settingsDialog.data })}
            onBackdropClick={() => setSettingsDialog({ open: false, data: settingsDialog.data })}
        />
    );
};
