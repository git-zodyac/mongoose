export default ({
  testMatch: [
    "**/*.(test|spec).ts"
  ],
  setupFiles: [
    "<rootDir>/src/setup.jest.ts"
  ],
  collectCoverage: true,
  coverageReporters: ["json-summary", "text"],
  coverageDirectory: "artifacts/coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.{d,types}.ts",
    "!src/**/types.ts",
  ],
  transform: {
    "^.+\\.[tj]s$": "@swc/jest"
  },
  extensionsToTreatAsEsm: [
    ".ts"
  ],
  moduleDirectories: ["node_modules", "<rootDir>"],
  modulePathIgnorePatterns: [
    "<rootDir>/.*/__mocks__"
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  roots: [
    "src",
    "<rootDir>"
  ]
});
