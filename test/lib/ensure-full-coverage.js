const lcovParse = require("lcov-parse");

lcovParse("coverage/lcov.info", (err, data) => {
  if (err) {
    console.error("Error parsing lcov file:", err);
    process.exit(1);
  }

  data.forEach((record) => {
    ["lines", "functions", "branches"].forEach((type) => {
      if(record[type].hit !== record[type].found) {
        process.exit(1);
      }
    });
  });
});
