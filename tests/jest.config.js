module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src", "<rootDir>/../package/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^contection$": "<rootDir>/../package/src/index.tsx",
    "^contection/(.*)$": "<rootDir>/../package/src/$1",
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

