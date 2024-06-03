/* eslint no-undef: 0 */
/* eslint @typescript-eslint/no-var-requires: 0 */

const customJestConfig = {
  verbose: true,
  // setupFilesAfterEnv: ['./jest/setupTests.ts'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '\\.(less|scss)$': 'identity-obj-proxy',
    '\\.(css)$': 'jest-css-modules',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
}
module.exports = customJestConfig
