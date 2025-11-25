import { isStorageAvailable } from "contection-storage-adapter/src/utils";

describe("isStorageAvailable", () => {
    it("should return true when storage is available", () => {
        const mockStorage = {
            getItem: jest.fn((key: string) => (key === "___ctn_test" ? "1" : null)),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            length: 0,
            key: jest.fn(),
        } as unknown as Storage;

        const result = isStorageAvailable(mockStorage as typeof localStorage);

        expect(result).toBe(true);
        expect(mockStorage.setItem).toHaveBeenCalledWith("___ctn_test", "1");
        expect(mockStorage.getItem).toHaveBeenCalledWith("___ctn_test");
        expect(mockStorage.removeItem).toHaveBeenCalledWith("___ctn_test");
    });

    it("should return false when storage.setItem throws", () => {
        const mockStorage = {
            setItem: jest.fn(() => {
                throw new Error("QuotaExceededError");
            }),
            getItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            length: 0,
            key: jest.fn(),
        } as unknown as Storage;

        const result = isStorageAvailable(mockStorage as typeof localStorage);

        expect(result).toBe(false);
    });

    it("should return false when storage.getItem returns different value", () => {
        const mockStorage = {
            getItem: jest.fn((key: string) => (key === "___ctn_test" ? "no" : null)),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            length: 0,
            key: jest.fn(),
        } as unknown as Storage;

        const result = isStorageAvailable(mockStorage as typeof localStorage);

        expect(result).toBe(false);
    });

    it("should return false when storage is undefined", () => {
        const result = isStorageAvailable(undefined as unknown as typeof localStorage);
        expect(result).toBe(false);
    });
});
