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
    .map(file => file.split(".")[0]) // Remove file extension
    .filter((name, i, self) => i === self.indexOf(name)); // Remove duplicates
}

benchmarks.forEach(benchmark => {
  const command = [
    "tachometer",
    "--browser=chrome-headless",
    `perf/versus.html?using=${versus}&benchmark=${benchmark}`,
    `perf/idiomorph.html?using=idiomorph&benchmark=${benchmark}`,
  ];
  console.log(`Current vs. ${versus}`);
  console.log(`Benchmark: ${benchmark}\n`);

  spawnSync("npx", command, { stdio: "inherit" });
});
