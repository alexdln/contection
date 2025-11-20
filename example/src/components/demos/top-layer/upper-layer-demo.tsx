import { useUpperLayerStore } from "contection-top-layer";

import { UpperLayers } from "../../../stores/top-layer-store";
import { Notification } from "../../ui/notification";
import { Tooltip } from "../../ui/tooltip";

export const UpperLayerDemo: React.FC = () => {
    const notification = useUpperLayerStore(UpperLayers.NotificationLayer);
    const tooltip = useUpperLayerStore(UpperLayers.TooltipLayer);

    return (
        <>
            {notification.data && <Notification type={notification.data.type} message={notification.data.message} />}
            {tooltip.data && <Tooltip content={tooltip.data.content} x={tooltip.data.x} y={tooltip.data.y} />}
        </>
    );
};
