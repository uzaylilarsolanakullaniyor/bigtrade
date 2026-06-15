/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    // Transpile-only (no type-checking) so tests are resilient to
    // framework type augmentations; `next build` does the real type-check.
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['indicators/**/*.ts', 'scoring/**/*.ts', 'lib/**/*.ts'],
};
