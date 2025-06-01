/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/lib/prisma$': '<rootDir>/lib/prisma.ts',
    '^@/(.*)$': '<rootDir>/$1',
  },
};