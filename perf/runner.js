const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

let benchmarks = process.argv.slice(2);
let versus;

if (benchmarks[0] === "morphdom" || /^v[\d.]+$/.test(benchmarks[0])) {
  versus = benchmarks.shift();
} else {
  versus = "morphdom";
}

if (benchmarks.length === 0) {
  benchmarks = fs
    .readdirSync(`${__dirname}/benchmarks`)
    .map((file) => file.split(".")[0]) // Remove file extension
    .filter((name, i, self) => i === self.indexOf(name)); // Remove duplicates
}

benchmarks.forEach((benchmark) => {
  const keepInputValues =
    process.env.KEEP_INPUT_VALUES === "true" ? "&keepInputValues=true" : "";
  const config = {
    root: "..",
    benchmarks: [
      {
        name: `${benchmark}: ${versus}`,
        url: `../perf/runner.html?using=${versus}&benchmark=${benchmark}`,
        browser: "chrome-headless",
      },
      {
        name: `${benchmark}: src/idiomorph.js`,
        url: `../perf/runner.html?using=idiomorph&benchmark=${benchmark}${keepInputValues}`,
        browser: "chrome-headless",
      },
    ],
  };
  fs.writeFileSync(
    path.resolve(__dirname, "../tmp/tachometer.json"),
    JSON.stringify(config),
    "utf8",
  );

  spawnSync("npx", ["tachometer", "--config=tmp/tachometer.json"], {
    stdio: "inherit",
  });
});
