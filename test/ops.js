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

  it("Show findSoftMatch aborting on two future soft matches", function () {
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

  it("findIdSetMatch rejects morphing node that would lose more IDs", function () {
    // here the findIdSetMatch function when it finds a node with id's it will track how many
    // id matches in this node and then as it searches for a matching node it will track
    // how many id's in the content it would have to remove before it finds a match
    // if it finds more ids are going to match in-between nodes it aborts matching to
    // allow better matching with less dom updates.
    assertOps(
      `<div>` +
        `<label>1</label><input id="first">` +
        `<label>2</label><input id="second">` +
        `<label>3</label><input id="third">` +
        `</div>`,

      `<div>` +
        `<label>3</label><input id="third">` +
        `<label>1</label><input id="first">` +
        `<label>2</label><input id="second">` +
        `</div>`,
      [
        [
          "Morphed",
          '<div><label>1</label><input id="first"><label>2</label><input id="second"><label>3</label><input id="third"></div>',
          '<div><label>3</label><input id="third"><label>1</label><input id="first"><label>2</label><input id="second"></div>',
        ],
        ["Morphed", "<label>1</label>", "<label>3</label>"],
        ["Morphed", '<input id="third">', '<input id="third">'],
        ["Added", "<label>1</label>"],
        ["Morphed", '<input id="first">', '<input id="first">'],
        ["Morphed", "<label>2</label>", "<label>2</label>"],
        ["Morphed", '<input id="second">', '<input id="second">'],
        ["Removed", "<label>3</label>"],
      ],
    );
  });  
});
