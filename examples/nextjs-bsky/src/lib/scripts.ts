export const themeScript = `(() => {
    if (localStorage.getItem("__ctn_theme")) {
        const theme = localStorage.getItem("__ctn_theme")?.replace(/"|%22/g, "").trim();
        if (theme === "light" || theme === "dark") {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dataset.themeMode = theme;
            return
        }
    }
    document.documentElement.dataset.themeMode = "system";
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.dataset.theme = "dark";
    }
})()`;
