export const isStorageAvailable = (storage: typeof localStorage | typeof sessionStorage) => {
    if (typeof storage !== "undefined") {
        try {
            storage.setItem("feature_test", "yes");
            if (storage.getItem("feature_test") === "yes") {
                storage.removeItem("feature_test");
                return true;
            }
        } catch {
            //
        }
    }
    return false;
};
