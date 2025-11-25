import "./styles.scss";
import { useUpperLayerReducer } from "contection-top-layer";
import { UpperLayers } from "../../../stores/top-layer-store";

interface NotificationProps {
    type: "info" | "success" | "warning" | "error";
    message: string;
}

const typeColors = {
    info: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
};

export const Notification: React.FC<NotificationProps> = ({ type, message }) => {
    const [, setNotification] = useUpperLayerReducer(UpperLayers.NotificationLayer);
    return (
        <div
            className="notification"
            style={{ backgroundColor: typeColors[type] }}
            onClick={() => setNotification((prev) => ({ ...prev, data: null }))}
        >
            <div className="notification__type">{type.toUpperCase()}</div>
            <div>{message}</div>
        </div>
    );
};
