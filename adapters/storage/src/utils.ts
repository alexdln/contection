export const isStorageAvailable = (storage: typeof localStorage | typeof sessionStorage) => {
    if (typeof storage !== "undefined") {
        try {
            storage.setItem("___ctn_test", "1");
            if (storage.getItem("___ctn_test") === "1") {
                storage.removeItem("___ctn_test");
                return true;
            }
        } catch {
            //
        }
    }
    return false;
};
