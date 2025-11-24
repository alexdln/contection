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

export const clone = <Obj, Keys extends Array<keyof Obj>>(cloning: Obj, keys: Keys) => {
    const result = {} as { [Key in Keys[number]]: Obj[Key] };
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        result[k] = cloning[k];
    }
    return result;
};

export const cloneAndCompare = <Obj, Keys extends Array<keyof Obj>>(cloning: Obj, keys: Keys, compareWith: Obj) => {
    const result = {} as { [Key in Keys[number]]: Obj[Key] };
    let isEqual = true;
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        result[k] = cloning[k];
        if (cloning[k] !== compareWith[k]) isEqual = false;
    }
    return { result, isEqual };
};
