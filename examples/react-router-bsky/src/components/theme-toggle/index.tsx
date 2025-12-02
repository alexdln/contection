"use client";

import { useStoreReducer } from "contection";

import { AppStore } from "@/src/providers/app-store/store";

import styles from "./theme-toggle.module.css";

export const ThemeToggle: React.FC = () => {
    const [, setStore] = useStoreReducer(AppStore);

    return (
        <div className={styles.container}>
            <button
                className={`${styles.button} ${styles.themeButtonLight}`}
                onClick={() => setStore({ theme: "light" })}
                aria-label="Light theme"
            >
                ☀️
            </button>
            <button
                className={`${styles.button} ${styles.themeButtonSystem}`}
                onClick={() => setStore({ theme: "system" })}
                aria-label="System theme"
            >
                💻
            </button>
            <button
                className={`${styles.button} ${styles.themeButtonDark}`}
                onClick={() => setStore({ theme: "dark" })}
                aria-label="Dark theme"
            >
                🌙
            </button>
        </div>
    );
};
