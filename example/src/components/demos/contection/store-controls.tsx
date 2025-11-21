import { useStoreReducer } from "contection";
import { useUpperLayerReducer } from "contection-top-layer";

import { AppStore, initialState } from "../../../stores/app-store";
import { UpperLayers } from "../../../stores/top-layer-store";
import { Button } from "../../ui/button";

import "./styles.scss";

export const StoreControls: React.FC = () => {
    const [, setStore] = useStoreReducer(AppStore);
    const [, setNotification] = useUpperLayerReducer(UpperLayers.NotificationLayer);

    const rapidUpdatesHandler = async () => {
        const summary = {
            counter: 0,
            settings: 0,
            user: 0,
            theme: 0,
        };
        for (let i = 0; i < 200; i++) {
            const nextTimezone = `UTC${Math.floor(i / 20)}`;
            await new Promise((resolve) => setTimeout(resolve, 20));
            const random = Math.random();
            if (random < 0.25) {
                summary.counter++;
                setStore((prev) => ({ counter: prev.counter + 1 }));
            } else if (random < 0.5) {
                summary.settings++;
                setStore((prev) => ({
                    settings:
                        prev.settings.timezone === nextTimezone
                            ? prev.settings
                            : { ...prev.settings, timezone: nextTimezone },
                }));
            } else if (random < 0.75) {
                summary.user++;
                setStore((prev) => ({
                    user: { ...prev.user, email: `${Math.random().toString(36).substring(7)}@example.com` },
                }));
            } else {
                summary.theme++;
                setStore({ theme: Math.random() > 0.5 ? "light" : "dark" });
            }
        }
        setNotification({
            data: {
                id: Math.random().toString(),
                message: `Random updates summary:\n${Object.entries(summary)
                    .map(([key, value]) => `${key}: ${value} times`)
                    .join(";\n")}`,
                type: "info",
            },
        });
    };
    console.log(initialState);

    return (
        <div className="demo-contection__controls">
            <Button onClick={() => setStore((prev) => ({ counter: prev.counter + 1 }))}>Increment</Button>
            <Button onClick={() => setStore((prev) => ({ counter: prev.counter - 1 }))}>Decrement</Button>
            <Button
                onClick={() =>
                    setStore((prev) => ({
                        user: { ...prev.user, name: `User ${Math.random().toString(36).substring(7)}` },
                    }))
                }
            >
                Change Name
            </Button>
            <Button
                onClick={() =>
                    setStore((prev) => ({
                        user: { ...prev.user, email: `${Math.random().toString(36).substring(7)}@example.com` },
                    }))
                }
            >
                Change email
            </Button>
            <Button onClick={() => setStore((prev) => ({ theme: prev.theme === "light" ? "dark" : "light" }))}>
                Toggle Theme
            </Button>
            <Button onClick={rapidUpdatesHandler}>Random updates</Button>
            <Button onClick={() => setStore({ ...initialState })}>Reset</Button>
        </div>
    );
};
