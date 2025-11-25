module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src", "<rootDir>/modules", "<rootDir>/adapters", "<rootDir>/../package/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "@src/(.*)$": "<rootDir>/src/$1",
    "^contection$": "<rootDir>/../package/src/index.tsx",
    "^contection/(.*)$": "<rootDir>/../package/$1",
    "^contection-viewport$": "<rootDir>/../modules/viewport/src/index.tsx",
    "^contection-viewport/(.*)$": "<rootDir>/../modules/viewport/$1",
    "^contection-top-layer$": "<rootDir>/../modules/top-layer/src/index.tsx",
    "^contection-top-layer/(.*)$": "<rootDir>/../modules/top-layer/$1",
    "^contection-storage-adapter$": "<rootDir>/../adapters/storage/src/index.ts",
    "^contection-storage-adapter/(.*)$": "<rootDir>/../adapters/storage/$1",
    "^contection-next-cookie-adapter$": "<rootDir>/../adapters/next-cookie/src/index.ts",
    "^contection-next-cookie-adapter/(.*)$": "<rootDir>/../adapters/next-cookie/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setup/jest.setup.ts"],
  collectCoverageFrom: [
    "../package/src/**/*.{ts,tsx}",
    "!../package/src/**/*.d.ts",
    "!../package/src/**/index.tsx",
  ],
  coverageDirectory: "./coverage",
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 10000,
};

