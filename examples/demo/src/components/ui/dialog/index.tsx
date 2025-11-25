import { Button } from "../button";

import "./styles.scss";

interface DialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    onBackdropClick?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ title, message, onConfirm, onCancel, onBackdropClick }) => {
    return (
        <>
            {onBackdropClick && <div className="dialog__backdrop" onClick={onBackdropClick} />}
            <div className="dialog">
                <div className="dialog__content">
                    <h2 className="dialog__title">{title}</h2>
                    <p className="dialog__message">{message}</p>
                    <div className="dialog__actions">
                        <Button onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onConfirm}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
