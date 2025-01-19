// This file describes the ideal operations for many common morphs.
// Skipped tests could be viewed as a TODO list for future improvements.

describe("morphing operations", function () {
  setup();

  it("removing anonymous siblings", function () {
    assertOps("<div><a>A</a><b>B</b><c>C</c></div>", "<div><b>B</b></div>", [
      ["Morphed", "<div><a>A</a><b>B</b><c>C</c></div>", "<div><b>B</b></div>"],
      ["Removed", "<a>A</a>"],
      ["Morphed", "<b>B</b>", "<b>B</b>"],
      ["Removed", "<c>C</c>"],
    ]);
  });

  it("removing IDed siblings", function () {
    assertOps(
      `<div><a id="a">A</a><b id="b">B</b><c id="c">C</c></div>`,
      `<div><b id="b">B</b></div>`,
      [
        [
          "Morphed",
          `<div><a id="a">A</a><b id="b">B</b><c id="c">C</c></div>`,
          `<div><b id="b">B</b></div>`,
        ],
        ["Removed", `<a id="a">A</a>`],
        ["Morphed", `<b id="b">B</b>`, `<b id="b">B</b>`],
        ["Removed", `<c id="c">C</c>`],
      ],
    );
  });

  it.skip("reordering anonymous siblings", function () {
    assertOps(
      "<div><a>A</a><b>B</b><c>C</c></div>",
      "<div><c>C</c><b>B</b><a>A</a></div>",
      [
        [
          "Morphed",
          "<div><a>A</a><b>B</b><c>C</c></div>",
          "<div><c>C</c><b>B</b><a>A</a></div>",
        ],
        ["Morphed", "<c>C</c>", "<c>C</c>"],
        ["Morphed", "<b>B</b>", "<b>B</b>"],
        ["Morphed", "<a>A</a>", "<a>A</a>"],
      ],
    );
  });

  it("reordering IDed siblings", function () {
    assertOps(
      `<div><a id="a">A</a><b id="b">B</b><c id="c">C</c></div>`,
      `<div><c id="c">C</c><b id="b">B</b><a id="a">A</a></div>`,
      [
        [
          "Morphed",
          `<div><a id="a">A</a><b id="b">B</b><c id="c">C</c></div>`,
          `<div><c id="c">C</c><b id="b">B</b><a id="a">A</a></div>`,
        ],
        ["Morphed", `<c id="c">C</c>`, `<c id="c">C</c>`],
        ["Morphed", `<b id="b">B</b>`, `<b id="b">B</b>`],
        ["Morphed", `<a id="a">A</a>`, `<a id="a">A</a>`],
      ],
    );
  });

  it.skip("prepending a new softmatchable node onto the beginning", function () {
    assertOps(
      "<section><a>A</a><a>B</a></section>",
      "<section><a>New</a><a>A</a><a>B</a></section>",
      [
        [
          "Morphed",
          "<section><a>A</a><a>B</a></section>",
          "<section><a>New</a><a>A</a><a>B</a></section>",
        ],
        ["Added", "<a>New</a>"],
        ["Morphed", "<a>A</a>", "<a>A</a>"],
        ["Morphed", "<a>B</a>", "<a>B</a>"],
      ],
    );
  });

  it.skip("inserting a new softmatchable node into the middle", function () {
    assertOps(
      "<section><a>A</a><a>B</a><a>C</a><a>D</a></section>",
      "<section><a>A</a><a>B</a><a>New</a><a>C</a><a>D</a></section>",
      [
        [
          "Morphed",
          "<section><a>A</a><a>B</a><a>C</a><a>D</a></section>",
          "<section><a>A</a><a>B</a><a>New</a><a>C</a><a>D</a></section>",
        ],
        ["Morphed", "<a>A</a>", "<a>A</a>"],
        ["Morphed", "<a>B</a>", "<a>B</a>"],
        ["Added", "<a>New</a>"],
        ["Morphed", "<a>C</a>", "<a>C</a>"],
        ["Morphed", "<a>D</a>", "<a>D</a>"],
      ],
    );
  });

  it("appending a new softmatchable node onto the end", function () {
    assertOps(
      "<section><a>A</a><a>B</a></section>",
      "<section><a>A</a><a>B</a><a>New</a></section>",
      [
        [
          "Morphed",
          "<section><a>A</a><a>B</a></section>",
          "<section><a>A</a><a>B</a><a>New</a></section>",
        ],
        ["Morphed", "<a>A</a>", "<a>A</a>"],
        ["Morphed", "<a>B</a>", "<a>B</a>"],
        ["Added", "<a>New</a>"],
      ],
    );
  });

  it.skip("removing a softmatchable node from the front", function () {
    assertOps(
      "<section><a>A</a><a>B</a><a>C</a></section>",
      "<section><a>B</a><a>C</a></section>",
      [
        [
          "Morphed",
          "<section><a>A</a><a>B</a><a>C</a></section>",
          "<section><a>B</a><a>C</a></section>",
        ],
        ["Removed", "<a>A</a>"],
        ["Morphed", "<a>B</a>", "<a>B</a>"],
        ["Morphed", "<a>C</a>", "<a>C</a>"],
      ],
    );
  });

  it.skip("removing a softmatchable node from the middle", function () {
    assertOps(
      "<section><a>A</a><a>B</a><a>C</a></section>",
      "<section><a>A</a><a>C</a></section>",
      [
        [
          "Morphed",
          "<section><a>A</a><a>B</a><a>C</a></section>",
          "<section><a>A</a><a>C</a></section>",
        ],
        ["Morphed", "<a>A</a>", "<a>A</a>"],
        ["Removed", "<a>B</a>"],
        ["Morphed", "<a>C</a>", "<a>C</a>"],
      ],
    );
  });

  it("removing a softmatchable node from the end", function () {
    assertOps(
      "<section><a>A</a><a>B</a><a>C</a></section>",
      "<section><a>A</a><a>B</a></section>",
      [
        [
          "Morphed",
          "<section><a>A</a><a>B</a><a>C</a></section>",
          "<section><a>A</a><a>B</a></section>",
        ],
        ["Morphed", "<a>A</a>", "<a>A</a>"],
        ["Morphed", "<a>B</a>", "<a>B</a>"],
        ["Removed", "<a>C</a>"],
      ],
    );
  });

  it("show softMatch aborting on two future soft matches", function () {
    // when nodes can't be softMatched because they have different types it will scan ahead
    // but it aborts the scan ahead if it finds two nodes ahead in both the new and old content
    // that softmatch so it can just insert the mis matched node it is on and get to the matching.
    assertOps(
      "<section><h1></h1><h2></h2><div></div></section>",
      "<section><div>Alert</div><h1></h1><h2></h2><div></div></section>",
      [
        [
          "Morphed",
          "<section><h1></h1><h2></h2><div></div></section>",
          "<section><div>Alert</div><h1></h1><h2></h2><div></div></section>",
        ],
        ["Added", "<div>Alert</div>"],
        ["Morphed", "<h1></h1>", "<h1></h1>"],
        ["Morphed", "<h2></h2>", "<h2></h2>"],
        ["Morphed", "<div></div>", "<div></div>"],
      ],
    );
  });
});
