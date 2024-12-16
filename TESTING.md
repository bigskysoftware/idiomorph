# Idiomorph Testing Guide

This guide outlines how to test Idiomorph, focusing on running tests headlessly or in a browser environment, running individual tests, and other testing concerns.

## Prerequisites

1. Ensure you have a currently supported Node.js and npm installed.
2. Install dependencies by running:
   ```bash
   npm install
   npx playwright install
   ```

## Running All Tests

To run all tests in headless mode, execute:
```bash
npm test
```
This will run all the tests using headless Chrome.

To run all tests against all browsers in headless mode, execute:
```bash
npm run ci
```
This will run the tests using Playwright’s headless browser setup across Chrome, Firefox, and WebKit (Safari-adjacent). This is ultimately what gets run in Github Actions to verify PRs.

To run all tests against Chrome with experimental `moveBefore` support added, execute:
```bash
npm run test-move-before
```
This will start headless Chrome in a new profile with the `atomic-move` experimental flag set. This runs in a separate job in CI.

## Running Individual Tests

### Headless Mode
To run a specific test file headlessly, for example `test/core.js`, use the following command:
```bash
npm test test/core.js
```
If you want to run only one specific test, you can temporarily change `it("...` to `it.only("...` in the test file, and then specify the test file as above. Don't forget to undo this before you commit!

### Headed Mode (Interactive Browser Tests)
To run tests in a non-headless mode (with a visible browser window):
```bash
npm run debug
```
This will start the server, and open the test runner in a browser. From there you can choose a test file to run.

## Code Coverage Report
After a test run completes, you can open `coverage/lcov-report/index.html` to view the code coverage report. On Ubuntu you can run:
```bash
xdg-open coverage/lcov-report/index.html
```

## Test Locations
- All tests are located in the `test/` directory. Only .js files in this directory will be discovered by the test runner, so support files can go in subdirectories.
- The `web-test-runner.config.mjs` file in the root directory contains the boilerplate HTML for the test runs, including `<script>` tags for the test dependencies.

