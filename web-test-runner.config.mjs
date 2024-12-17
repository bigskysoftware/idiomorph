export default {
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    include: ['src/**/*'],
  },
  files: "test/*.js",
  testRunnerHtml: (testFramework) => `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="/node_modules/chai/chai.js"></script>
      <script src="/node_modules/chai-dom/chai-dom.js"></script>
      <script>should = chai.should()</script>
      <script src="/test/lib/utilities.js"></script>
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
};

