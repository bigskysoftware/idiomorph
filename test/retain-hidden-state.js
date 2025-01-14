describe("Hidden state preservation tests", function () {
  setup();

  it("preserves all non-attribute element state", function () {
    getWorkArea().append(
      make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `),
    );
    document.getElementById("first").indeterminate = true;
    document.getElementById("second").indeterminate = true;

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves all non-attribute element state and outerHTML morphStyle", function () {
    const div = make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `);
    getWorkArea().append(div);
    document.getElementById("first").indeterminate = true;
    document.getElementById("second").indeterminate = true;

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves non-attribute state when elements are moved to different levels of the DOM", function () {
    getWorkArea().append(
      make(`
            <div>
              <input type="checkbox" id="first">
              <div>
                <input type="checkbox" id="second">
              </div>
            </div>
        `),
    );
    document.getElementById("first").indeterminate = true;
    document.getElementById("second").indeterminate = true;

    let finalSrc = `
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves non-attribute state when elements are moved between different containers", function () {
    getWorkArea().append(
      make(`
            <div>
              <div id="left">
                <input type="checkbox" id="first">
              </div>
              <div id="right">
                <input type="checkbox" id="second">
              </div>
            </div>
        `),
    );
    document.getElementById("first").indeterminate = true;
    document.getElementById("second").indeterminate = true;

    let finalSrc = `
            <div>
              <div id="left">
                <input type="checkbox" id="second">
              </div>
              <div id="right">
                <input type="checkbox" id="first">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves non-attribute state when parents are reorderd", function () {
    getWorkArea().append(
      make(`
            <div>
              <div id="left">
                <input type="checkbox" id="first">
              </div>
              <div id="right">
                <input type="checkbox" id="second">
              </div>
            </div>
        `),
    );
    document.getElementById("first").indeterminate = true;
    document.getElementById("second").indeterminate = true;

    let finalSrc = `
            <div>
              <div id="right">
                <input type="checkbox" id="second">
              </div>
              <div id="left">
                <input type="checkbox" id="first">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("duplicate ids on elements aborts matching to avoid invalid morph state", function () {
    // we try to reuse existing ids where possible and has to exclude matching on duplicate ids
    // to avoid losing content
    getWorkArea().append(
      make(`
            <div>
              <div id="left">
                <input type="text" id="first" value="first1">
                <input type="text" id="first" value="first2">
              </div>
              <div id="right">
                <input type="text" id="second" value="second1">
                <input type="text" id="second" value="second2">
              </div>
            </div>
        `),
    );
    document.getElementById("first").focus();

    let finalSrc = `
            <div>
              <div id="left">
                <input type="text" id="second" value="second1">
                <input type="text" id="second" value="second2">
              </div>
              <div id="right">
                <input type="text" id="first" value="first1">
                <input type="text" id="first" value="first2">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    // should have lost active element focus because duplicate ids can not be processed properly
    document.activeElement.outerHTML.should.equal(document.body.outerHTML);
  });

  it("duplicate destination ids on elements aborts matching to avoid invalid morph state", function () {
    // exclude matching on duplicate ids to avoid losing content
    getWorkArea().append(
      make(`
            <div>
              <div id="left">
                <input type="text" id="first" value="first1">
              </div>
              <div id="right">
                <input type="text" id="second" value="second1">
              </div>
            </div>
        `),
    );
    document.getElementById("first").focus();

    let finalSrc = `
            <div>
              <div id="left">
                <input type="text" id="second" value="second1">
                <input type="text" id="second" value="second2">
              </div>
              <div id="right">
                <input type="text" id="first" value="first1">
                <input type="text" id="first" value="first2">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    // should have lost active element focus because duplicate ids can not be processed properly
    document.activeElement.outerHTML.should.equal(document.body.outerHTML);
  });

  it("preserves all non-attribute element state and outerHTML morphStyle when morphing to two top level nodes", function () {
    // when using outerHTML you can replace one node with two nodes with the state preserving items split and it will just
    // pick one best node to morph and just insert the other nodes so need to check these also retain state
    const div = make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `);
    getWorkArea().append(div);
    document.getElementById("first").indeterminate = true;
    document.getElementById("second").indeterminate = true;

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
            </div>
            <input type="checkbox" id="first">
        `;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves all non-attribute element state and outerHTML morphStyle when morphing to two top level nodes with nesting", function () {
    // when using outerHTML you can replace one node with two nodes with the state preserving items split and it will just
    // pick one best node to morph and just insert the other nodes so need to check these also retain state
    const div = make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `);
    getWorkArea().append(div);
    document.getElementById("first").indeterminate = true;
    document.getElementById("second").indeterminate = true;

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
            </div>
            <div>
              <input type="checkbox" id="first">
            </div>
        `;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves all non-attribute element state when wrapping element changes tag", function () {
    // just changing the type from div to span of the wrapper causes softmatch to fail so it abandons all hope
    // of morphing and just inserts the node so we need to check this still handles preserving state here.
    const div = make(`
             <div>
               <div><input type="checkbox" id="first"></div>
             </div>
         `);
    getWorkArea().append(div);
    document.getElementById("first").indeterminate = true;

    let finalSrc = `
             <div>
               <span><input type="checkbox" id="first"></span>
             </div>
         `;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true]);
  });

  it("preserves all non-attribute element state when wrapping element changes tag at top level", function () {
    // just changing the type from div to span of the top wrapping item with outerHTML morph will cause morphOldNodeTo function
    // to morph the two nodes that don't softmatch that also needs to handle preserving state
    const div = make(`<div><input type="checkbox" id="first"></div>`);
    getWorkArea().append(div);
    document.getElementById("first").indeterminate = true;

    let finalSrc = `<span><input type="checkbox" id="first"></span>`;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true]);
  });

  it("moveBefore function fails back to insertBefore if moveBefore fails", function () {
    getWorkArea().append(
      make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `),
    );
    // replace moveBefore function with a boolean which will fail the try catch
    document.getElementById("first").parentNode.moveBefore = true;

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
  });

  it("moveBefore function falls back to insertBefore if moveBefore is missing", function () {
    getWorkArea().append(
      make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `),
    );
    // disable moveBefore function to force it to use insertBefore
    document.getElementById("first").parentNode.moveBefore = undefined;

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
  });

  it("moveBefore is used if it exists", function () {
    const div = make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `);
    getWorkArea().append(div);

    let called = false;
    div.moveBefore = function (element, after) {
      called = true;
      return div.insertBefore(element, after);
    };

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    called.should.be.true;
  });
});
