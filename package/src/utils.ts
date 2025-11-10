/** Checks if the code is running on the server side (window is undefined) */
export const checkIsServer = (): boolean => typeof window === "undefined";
