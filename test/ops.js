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

  it("reordering anonymous siblings", function () {
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
});
