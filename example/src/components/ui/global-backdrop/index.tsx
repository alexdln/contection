import { useTopLayerStore } from "contection-top-layer";

import { TopLayerStore } from "../../../stores/top-layer-store";

import "./styles.scss";

export const GlobalBackdrop: React.FC = () => {
    const { hasActiveIsolatedLayers } = useTopLayerStore(TopLayerStore, {
        keys: ["hasActiveIsolatedLayers"],
    });

    if (!hasActiveIsolatedLayers) return null;

    return <div className="global-backdrop" />;
};
