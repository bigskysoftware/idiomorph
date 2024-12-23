import {
  chromeLauncher,
  summaryReporter,
  defaultReporter,
} from "@web/test-runner";
import { exec } from "child_process";
import failOnly from "./test/lib/fail-only.mjs";

let config = {
  testRunnerHtml: (testFramework) => `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="/node_modules/chai/chai.js"></script>
      <script src="/node_modules/chai-dom/chai-dom.js"></script>
      <script>
          should = chai.should();
          window.useMoveBefore = ${process.env.USE_MOVE_BEFORE};
      </script>
      <script src="/test/lib/utilities.js"></script>
      <script src="/test/lib/wait-for.js"></script>
      <script src="/node_modules/sinon/pkg/sinon.js"></script>

      <script src="/src/idiomorph.js"></script>
      <script src="/node_modules/htmx.org/dist/htmx.js"></script>
      <script src="/src/idiomorph-htmx.js"></script>
      <script src="/test/lib/morphdom.js"></script>

      <script type="module" src="${testFramework}"></script>
    </head>
    <body>
      <em>Work Area</em>
      <hr/>
      <pre id="work-area" hx-ext="morph">
        Output Here...
      </pre>
    </body>
    </html>
  `,

  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    include: ["src/**/*"],
  },
  files: "test/*.js",
  plugins: [failOnly],
  reporters: [summaryReporter(), defaultReporter()],
};

if (process.env.USE_MOVE_BEFORE) {
  // configure chrome to use a custom profile directory we control
  config.browsers = [
    chromeLauncher({
      launchOptions: { args: ["--user-data-dir=test/chrome-profile"] },
    }),
  ];
  exec(
    [
      "rm -rf test/chrome-profile", // clear profile out from last run
      "mkdir -p test/chrome-profile", // create from scratch
      `echo '{"browser":{"enabled_labs_experiments":["atomic-move@1"]}}' > test/chrome-profile/Local\\ State`, // enable experiment
    ].join(" && "),
  );
}

export default config;
