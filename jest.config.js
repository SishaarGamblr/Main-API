/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  roots: [
    './src',
    './test'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  modulePathIgnorePatterns: [
    '/dist/'
  ]
};