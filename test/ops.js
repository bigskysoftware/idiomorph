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
      "<section><div></div><div></div></section>",
      "<section><div>New</div><div></div><div></div></section>",
      [
        [
          "Morphed",
          "<section><div></div><div></div></section>",
          "<section><div>New</div><div></div><div></div></section>",
        ],
        ["Added", "<div>New</div>"],
        ["Morphed", "<div></div>", "<div></div>"],
        ["Morphed", "<div></div>", "<div></div>"],
      ],
    );
  });

  it.skip("inserting a new softmatchable node into the middle", function () {
    assertOps(
      "<section><div></div><div></div><div></div><div></div></section>",
      "<section><div></div><div></div><div>New</div><div></div><div></div></section>",
      [
        [
          "Morphed",
          "<section><div></div><div></div><div></div><div></div></section>",
          "<section><div></div><div></div><div>New</div><div></div><div></div></section>",
        ],
        ["Morphed", "<div></div>", "<div></div>"],
        ["Morphed", "<div></div>", "<div></div>"],
        ["Added", "<div>New</div>"],
        ["Morphed", "<div></div>", "<div></div>"],
        ["Morphed", "<div></div>", "<div></div>"],
      ],
    );
  });

  it("pushing a new softmatchable node onto the end", function () {
    assertOps(
      "<section><div></div><div></div></section>",
      "<section><div></div><div></div><div>New</div></section>",
      [
        [
          "Morphed",
          "<section><div></div><div></div></section>",
          "<section><div></div><div></div><div>New</div></section>",
        ],
        ["Morphed", "<div></div>", "<div></div>"],
        ["Morphed", "<div></div>", "<div></div>"],
        ["Added", "<div>New</div>"],
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

  it("findBestMatch rejects morphing node that would lose more IDs", function () {
    // here the findBestMatch function when it finds a node with id's it will track how many
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

  it("show bestMatch routine can match the best old node for morphing", function () {
    // the findBestMatch can detect when there is a single node with id's remaining and instead
    // of matching the first node it will instead find the node with the most mathing id's so
    // it can retain the most state possible by displacing the least nodes with id's and their siblings.
    assertOps(
      `<div>`+
        `<input type="text" id="first">`+
        `<p>i will get lost</p>`+
        `<input type="text" id="second">`+
        `<p>i will get saved</p>`+
        `<input type="text" id="third">`+
        `<p>i will get saved</p>`+
      `</div>`,

      `<div>`+
        `<input type="text" id="first">`+
        `<p>i will get lost</p>`+
      `</div>`+
      `<div>`+  
        `<input type="text" id="second">`+
        `<p>i will get saved</p>`+
        `<input type="text" id="third">`+
        `<p>i will get saved</p>`+
      `</div>`,
      [
        [
          'Added',
          '<div><input type="text" id="first"><p>i will get lost</p></div>'
        ],
        [
          'Morphed',
          '<div></div>',
          '<div><input type="text" id="first"><p>i will get lost</p></div>'
        ],
        [
          'Morphed',
          '<input type="text" id="first">',
          '<input type="text" id="first">'
        ],
        [ 'Added', '<p>i will get lost</p>' ],
        [
          'Morphed',
          '<div><p>i will get lost</p><input type="text" id="second"><p>i will get saved</p><input type="text" id="third"><p>i will get saved</p></div>',        
          '<div><input type="text" id="second"><p>i will get saved</p><input type="text" id="third"><p>i will get saved</p></div>'
        ],
        [ 'Removed', '<p>i will get lost</p>' ],
        [
          'Morphed',
          '<input type="text" id="second">',
          '<input type="text" id="second">'
        ],
        [ 'Morphed', '<p>i will get saved</p>', '<p>i will get saved</p>' ],
        [
          'Morphed',
          '<input type="text" id="third">',
          '<input type="text" id="third">'
        ],
        [ 'Morphed', '<p>i will get saved</p>', '<p>i will get saved</p>' ]
      ],
      false,
    );
  });

  it("show bestMatch routine can match the best old node for morphing with deeper content", function () {
    // the new bestMatch also handles checking on inner children scans for the best last node with ids
    // to match with while before it was only run on the top node
    assertOps(
      `<div>`+
        `<div>`+
          `<input type="text" id="first">`+
          `<p>i will get lost</p>`+
          `<input type="text" id="second">`+
          `<p>i will get saved</p>`+
          `<input type="text" id="third">`+
          `<p>i will get saved</p>`+
        `</div>`+
      `</div>`,

      `<div>`+
        `<div>`+
          `<input type="text" id="first">`+
          `<p>i will get lost</p>`+
        `</div>`+
        `<div>`+  
          `<input type="text" id="second">`+
          `<p>i will get saved</p>`+
          `<input type="text" id="third">`+
          `<p>i will get saved</p>`+
        `</div>`+
      `</div>`,
      [
        [
          'Morphed',
          '<div><div><input type="text" id="first"><p>i will get lost</p><input type="text" id="second"><p>i will get saved</p><input type="text" id="third"><p>i will get saved</p></div></div>',
          '<div><div><input type="text" id="first"><p>i will get lost</p></div><div><input type="text" id="second"><p>i will get saved</p><input type="text" id="third"><p>i will get saved</p></div></div>'
        ],
        [
          'Added',
          '<div><input type="text" id="first"><p>i will get lost</p></div>'
        ],
        [
          'Morphed',
          '<div></div>',
          '<div><input type="text" id="first"><p>i will get lost</p></div>'
        ],
        [
          'Morphed',
          '<input type="text" id="first">',
          '<input type="text" id="first">'
        ],
        [ 'Added', '<p>i will get lost</p>' ],
        [
          'Morphed',
          '<div><p>i will get lost</p><input type="text" id="second"><p>i will get saved</p><input type="text" id="third"><p>i will get saved</p></div>',        
          '<div><input type="text" id="second"><p>i will get saved</p><input type="text" id="third"><p>i will get saved</p></div>'
        ],
        [ 'Removed', '<p>i will get lost</p>' ],
        [
          'Morphed',
          '<input type="text" id="second">',
          '<input type="text" id="second">'
        ],
        [ 'Morphed', '<p>i will get saved</p>', '<p>i will get saved</p>' ],
        [
          'Morphed',
          '<input type="text" id="third">',
          '<input type="text" id="third">'
        ],
        [ 'Morphed', '<p>i will get saved</p>', '<p>i will get saved</p>' ]
      ],
    );
  });

  it("show bestMatch routine can match the best old node for morphing and adding dummy div before", function () {
    assertOps(
      `<div>`+
        `<input type="text" id="focus">`+
      `</div>`,

      `<div></div>`+
        `<div>`+
        `<input type="text" id="focus">`+  
      `</div>`,
      [
        [ 'Added', '<div></div>' ],
        [
          'Morphed',
          '<div><input type="text" id="focus"></div>',
          '<div><input type="text" id="focus"></div>'
        ],
        [
          'Morphed',
          '<input type="text" id="focus">',
          '<input type="text" id="focus">'
        ]
      ],
      false,
    );
  });
});
