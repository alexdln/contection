import { useEffect } from "react";
import { useTopLayerStore } from "contection-top-layer";

import { TopLayerStore } from "../../../stores/top-layer-store";

export const OverflowBlocker: React.FC = () => {
    const { hasActiveIsolatedLayers } = useTopLayerStore(TopLayerStore, {
        keys: ["hasActiveIsolatedLayers"],
    });

    useEffect(() => {
        if (hasActiveIsolatedLayers) {
            document.documentElement.style.setProperty("overflow", "hidden");
        } else {
            document.documentElement.style.removeProperty("overflow");
        }

        return () => {
            document.documentElement.style.removeProperty("overflow");
        };
    }, [hasActiveIsolatedLayers]);

    return null;
};
