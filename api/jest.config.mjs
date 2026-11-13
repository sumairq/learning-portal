export default {
  testEnvironment: "node",
  transform: { "^.+\\.ts$": "@swc/jest" },
  setupFiles: ["<rootDir>/src/test/load-env.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testTimeout: 30000,
};
