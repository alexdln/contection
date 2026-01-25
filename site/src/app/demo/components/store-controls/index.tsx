"use client";

import { useStoreReducer } from "contection";

import { DemoStore, initialState } from "../../store";

import "./styles.scss";

export function StoreControls() {
    const [, setStore] = useStoreReducer(DemoStore);

    const rapidUpdates = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const node = e.currentTarget;
        node.disabled = true;
        for (let i = 0; i < 500; i++) {
            await new Promise((r) => setTimeout(r, 0));
            const random = Math.random();
            if (random < 0.33) {
                setStore((prev) => ({ counter: prev.counter + 1 }));
            } else if (random < 0.66) {
                setStore((prev) => ({
                    user: { ...prev.user, email: `${Math.random().toString(36).slice(2, 8)}@demo.com` },
                }));
            } else {
                setStore((prev) => ({ theme: (prev.theme === "light" ? "dark" : "light") as "light" | "dark" }));
            }
        }
        node.disabled = false;
    };

    return (
        <div className="controls">
            <div className="control-group">
                <span className="control-label">Counter</span>
                <div className="control-buttons">
                    <button className="btn" onClick={() => setStore((p) => ({ counter: p.counter - 1 }))}>
                        -1
                    </button>
                    <button className="btn primary" onClick={() => setStore((p) => ({ counter: p.counter + 1 }))}>
                        +1
                    </button>
                </div>
            </div>

            <div className="control-group">
                <span className="control-label">User</span>
                <div className="control-buttons">
                    <button
                        className="btn"
                        onClick={() =>
                            setStore((p) => ({
                                user: { ...p.user, name: `User_${Math.random().toString(36).slice(2, 6)}` },
                            }))
                        }
                    >
                        New Name
                    </button>
                    <button
                        className="btn"
                        onClick={() =>
                            setStore((p) => ({
                                user: { ...p.user, email: `${Math.random().toString(36).slice(2, 8)}@demo.com` },
                            }))
                        }
                    >
                        New Email
                    </button>
                </div>
            </div>

            <div className="control-group">
                <span className="control-label">Theme</span>
                <div className="control-buttons">
                    <button
                        className="btn"
                        onClick={() =>
                            setStore((p) => ({ theme: (p.theme === "light" ? "dark" : "light") as "light" | "dark" }))
                        }
                    >
                        <DemoStore.Consumer options={{ keys: ["theme"] }}>
                            {({ theme }) => (theme === "light" ? "Light" : "Dark")}
                        </DemoStore.Consumer>
                    </button>
                </div>
            </div>

            <div className="control-group actions">
                <button className="btn primary" onClick={rapidUpdates}>
                    Rapid 500 Updates
                </button>
                <button className="btn ghost" onClick={() => setStore({ ...initialState })}>
                    Reset
                </button>
            </div>
        </div>
    );
}
