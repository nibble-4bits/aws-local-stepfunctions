/* eslint-disable @typescript-eslint/no-var-requires */

const { defaults: tsjPreset } = require('ts-jest/presets');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['./__tests__/customMatchers.ts'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'd.ts', 'json'],
  verbose: true,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        ...tsjPreset.transform,
        tsconfig: './__tests__/tsconfig.json',
      },
    ],
  },
};
