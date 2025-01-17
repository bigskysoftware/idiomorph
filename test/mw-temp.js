describe("Michael West temp tests", function () {
  setup();

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

  it.skip("findIdSetMatch rejects morphing node that would lose more IDs", function () {
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
        ["Morphed", "1", "3"],
        ["Morphed", '<input id="third">', '<input id="third">'],
        ["Added", "<label>1</label>"],
        ["Morphed", '<input id="first">', '<input id="first">'],
        ["Morphed", "<label>2</label>", "<label>2</label>"],
        ["Morphed", "2", "2"],
        ["Morphed", '<input id="second">', '<input id="second">'],
        ["Removed", "<label>3</label>"],
      ],
    );
  });

  // five tests that show it is possible with the right activeElement preservation tricks you could preserve focus both ways
  it.skip("preserves focus state and outerHTML morphStyle first", function () {
    const div = make(`
            <div>
                <input type="text" id="first">
                <input type="text" id="second">
            </div>
        `);
    getWorkArea().append(div);
    document.getElementById("first").focus();

    let finalSrc = `
            <div>
                <input type="text" id="second">
                <input type="text" id="first">
            </div>
        `;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    document.activeElement.outerHTML.should.equal(
      document.getElementById("first").outerHTML,
    );
  });

  it.skip("preserves focus state and outerHTML morphStyle second", function () {
    const div = make(`
            <div>
                <input type="text" id="first">
                <input type="text" id="second">
            </div>
        `);
    getWorkArea().append(div);
    document.getElementById("second").focus();

    let finalSrc = `
            <div>
                <input type="text" id="second">
                <input type="text" id="first">
            </div>
        `;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    document.activeElement.outerHTML.should.equal(
      document.getElementById("second").outerHTML,
    );
  });
  it.skip("preserves focus state when parents are reordered first", function () {
    getWorkArea().append(
      make(`
            <div>
                <div id="with-focus">
                <input type="text" id="focus">
                </div>
                <div id="with-other">
                <input type="text" id="other">
                </div>
            </div>
        `),
    );
    document.getElementById("focus").focus();

    let finalSrc = `
            <div>
                <div id="with-other">
                <input type="text" id="other">
                </div>
                <div id="with-focus">
                <input type="text" id="focus">
                </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    document.activeElement.outerHTML.should.equal(
      document.getElementById("focus").outerHTML,
    );
    getWorkArea().innerHTML.should.equal(finalSrc);
  });

  it.skip("preserves focus state when parents are reordered second", function () {
    getWorkArea().append(
      make(`
            <div>
                <div id="with-other">
                <input type="text" id="other">
                </div>
                <div id="with-focus">
                <input type="text" id="focus">
                </div>
            </div>
        `),
    );
    document.getElementById("focus").focus();

    let finalSrc = `
            <div>
                <div id="with-focus">
                <input type="text" id="focus">
                </div>
                <div id="with-other">
                <input type="text" id="other">
                </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    document.activeElement.outerHTML.should.equal(
      document.getElementById("focus").outerHTML,
    );
    getWorkArea().innerHTML.should.equal(finalSrc);
  });

  it.skip("preserves focus state when previous element is replaced", function () {
    getWorkArea().innerHTML = `
            <div>
              <a id="a"></a>
              <input type="text" id="focus">
              <b id="b"></b>
            </div>
        `;
    document.getElementById("focus").focus();

    let finalSrc = `
            <div>
              <b id="b"></b>
              <input type="text" id="focus">
              <a id="a"></a>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    document.activeElement.outerHTML.should.equal(
      document.getElementById("focus").outerHTML,
    );
  });

  // tests for the old bestMatch outerHTML routine and showing how we can preserve this funciton and improve it as well for inner morphs

  it.skip("show bestMatch routine can match the best old node for morphing", function () {
    const div = make(
      `
            <div>
              <input type="text" id="first">
              <input type="text" id="second">
              <input type="text" id="third">
            </div>
        `.trim(),
    );
    getWorkArea().append(div);
    document.getElementById("first").focus();
    // disable moveBefore to force it to follow bestMatch routine every time
    document.getElementById("first").parentNode.moveBefore = undefined;
    document.getElementById("first").parentNode.parentNode.moveBefore =
      undefined;

    let finalSrc = `
            <div>
              <input type="text" id="first">
            </div>
            <div>  
              <input type="text" id="second">
              <input type="text" id="third">
            </div>
        `.trim();
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (document.body.moveBefore) {
      // moveBefore would prevent the node being discarded and losing state so we can't detect easily if bestMatch is picking the best node to match
      document.activeElement.outerHTML.should.equal(
        document.getElementById("first").outerHTML,
      );
    } else {
      // but testing with no moveBefore we can test it
      // first input should have been discarded because it was not the best match for the final id'ed node in the source
      // It should instead moprh the div into the second node that contains 2 nodes that can be preserved
      document.activeElement.outerHTML.should.equal(document.body.outerHTML);
    }
  });

  it.skip("show bestMatch routine can match the best old node for morphing and adding dummy div before", function () {
    const div = make(
      `
            <div>
              <input type="text" id="focus">
            </div>
        `.trim(),
    );
    getWorkArea().append(div);
    document.getElementById("focus").focus();

    let finalSrc = `
            <div></div>
            <div>
              <input type="text" id="focus">  
            </div>
        `.trim();
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    // the bestMatch code should find that the second destination div is a better id match than the first empty div and retain focus here
    document.activeElement.outerHTML.should.equal(
      document.getElementById("focus").outerHTML,
    );
  });

  it.skip("show bestMatch routine disabled losing focus", function () {
    const div = make(
      `
            <div>
              <input type="text" id="focus">
            </div>
        `.trim(),
    );
    getWorkArea().append(div);
    document.getElementById("focus").focus();
    // disable best match by tricking it into thinking moveBefore exists which prevents bestMatch function
    document.getElementById("focus").parentNode.moveBefore = true;
    document.getElementById("focus").parentNode.parentNode.moveBefore = true;

    let finalSrc = `
            <div></div>
            <div>
              <input type="text" id="focus">  
            </div>
        `.trim();
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (document.body.moveBefore) {
      // moveBefore would prevent the node being discarded and losing state so we can't detect easily if bestMatch being disabled breaks focus
      document.activeElement.outerHTML.should.equal(
        document.getElementById("focus").outerHTML,
      );
    } else {
      // but testing with no moveBefore we can test it
      // should have not performed bestMatch routine so focus div should have been morphed into an empty div losing focus
      document.activeElement.outerHTML.should.equal(document.body.outerHTML);
    }
  });

  it.skip("show bestMatch routine can match the best old node for morphing with deeper content", function () {
    // the new routine also handles bestMatch checking on inner children scans while before it was only run on the top node
    const div = make(
      `
            <div>
              <div>
                <input type="text" id="focus">
              </div>
            </div>
        `.trim(),
    );
    getWorkArea().append(div);
    document.getElementById("focus").focus();

    let finalSrc = `
            <div>
              <div></div>
              <div>
                <input type="text" id="focus">  
              </div>
            </div>
        `.trim();
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    // the bestMatch code should find that the second destination div is a better id match than the first empty div and retain focus here
    document.activeElement.outerHTML.should.equal(
      document.getElementById("focus").outerHTML,
    );
  });
});
