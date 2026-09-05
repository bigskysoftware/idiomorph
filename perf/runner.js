import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { chromium } from "playwright";

let benchmarks = process.argv.slice(2);
let versus;
let options = "{}";

benchmarks = benchmarks.filter((arg) => {
  const match = arg.match(/^--options=(.*)$/);
  if (match) {
    options = match[1];
    return false;
  }
  return true;
});

if (
  benchmarks[0] === "morphdom" ||
  /^v[\d.]+$/.test(benchmarks[0]) ||
  /\.js$/.test(benchmarks[0])
) {
  versus = benchmarks.shift();
} else {
  versus = "morphdom";
}

if (benchmarks.length === 0) {
  benchmarks = fs
    .readdirSync(new URL("benchmarks", import.meta.url))
    .map((file) => file.split(".")[0]) // Remove file extension
    .filter((name, i, self) => i === self.indexOf(name)); // Remove duplicates
}

const browser = {
  name: "chrome",
  headless: true,
  binary: chromium.executablePath(),
  addArguments: ["--no-sandbox"], // playwright's chromium ships without the setuid sandbox helper
};

benchmarks.forEach((benchmark) => {
  const config = {
    root: "..",
    benchmarks: [
      {
        name: `${benchmark}: ${versus}`,
        url: `../perf/runner.html?using=${versus}&benchmark=${benchmark}&options=${encodeURIComponent(options)}`,
        browser,
      },
      {
        name: `${benchmark}: src/idiomorph.js`,
        url: `../perf/runner.html?using=idiomorph&benchmark=${benchmark}&options=${encodeURIComponent(options)}`,
        browser,
      },
    ],
  };
  fs.writeFileSync(
    new URL("../tmp/tachometer.json", import.meta.url),
    JSON.stringify(config),
    "utf8",
  );

  spawnSync("npx", ["tachometer", "--config=tmp/tachometer.json"], {
    stdio: "inherit",
  });
});
