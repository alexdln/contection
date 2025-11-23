import { isStorageAvailable } from "contection-storage-adapter/src/utils";

describe("isStorageAvailable", () => {
    it("should return true when storage is available", () => {
        const mockStorage = {
            getItem: jest.fn((key: string) => (key === "feature_test" ? "yes" : null)),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            length: 0,
            key: jest.fn(),
        } as unknown as Storage;

        const result = isStorageAvailable(mockStorage as typeof localStorage);

        expect(result).toBe(true);
        expect(mockStorage.setItem).toHaveBeenCalledWith("feature_test", "yes");
        expect(mockStorage.getItem).toHaveBeenCalledWith("feature_test");
        expect(mockStorage.removeItem).toHaveBeenCalledWith("feature_test");
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
            getItem: jest.fn((key: string) => (key === "feature_test" ? "no" : null)),
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
