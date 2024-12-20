describe("Tests to compare perf with morphdom", function () {
  setup();

  it("HTML5 Elements Sample Page", function (done) {
    runPerfTest(
      "HTML5 Demo",
      "/test/perf/perf1.start",
      "/test/perf/perf1.end",
      done,
    );
  });

  it("Large Table performance", function (done) {
    runPerfTest(
      "Large Table Perf",
      "/test/perf/table.start",
      "/test/perf/table.end",
      done,
    );
  });

  it("Checkboxes Performance", function (done) {
    runPerfTest(
      "Checkboxes Performance",
      "/test/perf/checkboxes.start",
      "/test/perf/checkboxes.start",
      done,
    );
  });

  function runPerfTest(testName, startUrl, endUrl, done) {
    let startPromise = fetch(startUrl).then((value) => value.text());
    let endPromise = fetch(endUrl).then((value) => value.text());
    Promise.all([startPromise, endPromise]).then((value) => {
      let start = value[0];
      let end = value[1];

      let startElt = make(start);
      let endElt = make(end);
      // // debugging output
      // console.log("Content Size");
      // console.log("  Start: " + start.length + " characters");
      // console.log("  End  : " + end.length + " characters");
      console.time("idiomorph timing");
      Idiomorph.morph(startElt, endElt);
      // startElt.outerHTML.should.equal(end);
      console.timeEnd("idiomorph timing");

      let startElt2 = make(start);
      let endElt2 = make(end);
      console.time("morphdom timing");
      morphdom(startElt2, endElt2, {});
      // wow morphdom doesn't match...
      // startElt2.outerHTML.should.equal(end);
      console.timeEnd("morphdom timing");
      done();
    });
  }
});
