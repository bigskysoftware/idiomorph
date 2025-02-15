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
This will run the tests using Playwright’s headless browser setup across Chrome, Firefox, and WebKit (Safari-adjacent). This is ultimately what gets run in Github Actions to verify PRs. This build will fail if there is an `it.only` left in the codebase, thanks to a custom `--fail-only` command line argument.

## Running Individual Tests

### Headless Mode
To run a specific test file headlessly, for example `test/core.js`, use the following command:
```bash
npm test test/core.js
```
If you want to run only one specific test, you can temporarily change `it("...` to `it.only("...` in the test file, and then specify the test file as above. Don't forget to undo this before you commit!

### Browser Mode
To run tests directly in the browser, simply `open test/index.html` in a browser.
On Ubuntu you can run:
```bash
xdg-open test/index.html
```
This runs all the tests in the browser using Mocha instead of web-test-runner for easier debugging.

If you really want to open web-test-runner in headed mode, you can run:
```bash
npm run test:debug
```
This will start the server, and open the test runner in a browser. From there you can choose a test file to run.

## GitHub Actions CI matrix
On each push and PR, GitHub Actions runs the following test matrix:

1. `npm run ci` - Run all tests on Chrome, Firefox, and WebKit.
2. `npm run test:coverage` - Run all tests, and fail if coverage is below 100%.
3. `npm run typecheck` - Run TypeScript type checking.
4. `npm run format:check`- Check that all files are formatted correctly.

## Code Coverage Report
After a test run completes, you can open `coverage/lcov-report/index.html` to view the code coverage report. On Ubuntu you can run:
```bash
xdg-open coverage/lcov-report/index.html
```

## Test Locations
- All tests are located in the `test/` directory. Only .js files in this directory will be discovered by the test runner, so support files can go in subdirectories.
- The `web-test-runner.config.mjs` file in the root directory contains the boilerplate HTML for the test runs, including `<script>` tags for the test dependencies.

## Performance Benchmarks
See [PERFORMANCE.md](PERFORMANCE.md) for information on running performance benchmarks.

