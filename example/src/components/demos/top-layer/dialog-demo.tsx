import { useDialogStore, useDialogReducer } from "contection-top-layer";

import { Dialogs } from "../../../stores/top-layer-store";
import { Dialog } from "../../ui/dialog";

export const DialogDemo: React.FC = () => {
    const confirmDialog = useDialogStore(Dialogs.ConfirmDialog);
    const [, setConfirmDialog] = useDialogReducer(Dialogs.ConfirmDialog);

    return (
        <Dialog
            title={confirmDialog.data.title}
            message={confirmDialog.data.message}
            onConfirm={confirmDialog.data.onConfirm}
            onCancel={confirmDialog.data.onCancel}
            onBackdropClick={() => {
                setConfirmDialog({ open: false, data: confirmDialog.data });
            }}
        />
    );
};
