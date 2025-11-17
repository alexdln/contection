/** Checks if the code is running on the server side (window is undefined) */
export const checkIsServer = (): boolean => typeof window === "undefined";

export const removeItemFromArray = <T>(array: T[], item: T): T[] => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
            break;
        }
    }
    return array;
};
