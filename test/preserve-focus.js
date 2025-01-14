describe("Preserves focus where possible", function () {
  setup();

  it("preserves focus state and outerHTML morphStyle", function () {
    const div = make(`
            <div>
              <input type="text" id="focused" value="abc">
              <input type="text" id="other">
            </div>
        `);
    getWorkArea().append(div);
    setFocusAndSelection("focused", "b");

    let finalSrc = `
            <div>
              <input type="text" id="other">
              <input type="text" id="focused" value="abc">
            </div>
        `;
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML" });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (hasMoveBefore()) {
      assertFocus("focused");
      // TODO moveBefore loses selection on Chrome 131.0.6778.264
      // expect will be fixed in future release
      // assertFocusAndSelection("focused", "b");
    } else {
      assertNoFocus();
    }
  });

  it("preserves focus state when previous element is replaced", function () {
    getWorkArea().innerHTML = `
            <div>
              <a></a>
              <input type="text" id="focused" value="abc">
            </div>
        `;
    setFocusAndSelection("focused", "b");

    let finalSrc = `
            <div>
              <b></b>
              <input type="text" id="focused" value="abc">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("preserves focus state when elements are moved to different levels of the DOM", function () {
    getWorkArea().append(
      make(`
            <div>
              <input type="text" id="other">
              <div>
                <input type="text" id="focused" value="abc">
              </div>
            </div>
        `),
    );
    setFocusAndSelection("focused", "b");

    let finalSrc = `
            <div>
              <input type="text" id="other">
              <input type="text" id="focused" value="abc">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (hasMoveBefore()) {
      assertFocus("focused");
      // TODO moveBefore loses selection on Chrome 131.0.6778.264
      // expect will be fixed in future release
      // assertFocusAndSelection("focused", "b");
    } else {
      assertNoFocus();
    }
  });

  it("preserves focus state when focused element is moved between anonymous containers", function () {
    getWorkArea().innerHTML = `
            <div>
              <input type="text" id="other">
            </div>
            <div>
              <input type="text" id="focused" value="abc">
            </div>
        `;
    setFocusAndSelection("focused", "b");

    let finalSrc = `
            <div>
              <input type="text" id="other">
              <input type="text" id="focused" value="abc">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (hasMoveBefore()) {
      assertFocus("focused");
      // TODO moveBefore loses selection on Chrome 131.0.6778.264
      // expect will be fixed in future release
      // assertFocusAndSelection("focused", "b");
    } else {
      assertNoFocus();
    }
  });

  it("preserves focus state when elements are moved between IDed containers", function () {
    getWorkArea().append(
      make(`
            <div>
              <div id="left">
                <input type="text" id="focused" value="abc">
              </div>
              <div id="right">
                <input type="text" id="other">
              </div>
            </div>
        `),
    );
    setFocusAndSelection("focused", "b");

    let finalSrc = `
            <div>
              <div id="left">
                <input type="text" id="other">
              </div>
              <div id="right">
                <input type="text" id="focused" value="abc">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (hasMoveBefore()) {
      assertFocus("focused");
      // TODO moveBefore loses selection on Chrome 131.0.6778.264
      // expect will be fixed in future release
      // assertFocusAndSelection("focused", "b");
    } else {
      assertNoFocus();
    }
  });

  it("preserves focus state when focus parent is moved down", function () {
    getWorkArea().append(
      make(`
            <div>
              <div id="with-focus">
                <input type="text" id="focused" value="abc">
              </div>
              <div id="with-other">
                <input type="text" id="other">
              </div>
            </div>
        `),
    );
    setFocusAndSelection("focused", "b");

    let finalSrc = `
            <div>
              <div id="with-other">
                <input type="text" id="other">
              </div>
              <div id="with-focus">
                <input type="text" id="focused" value="abc">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (hasMoveBefore()) {
      assertFocus("focused");
      // TODO moveBefore loses selection on Chrome 131.0.6778.264
      // expect will be fixed in future release
      // assertFocusAndSelection("focused", "b");
    } else {
      assertNoFocus();
    }
  });

  it("preserves focus state when focus parent is moved up", function () {
    getWorkArea().append(
      make(`
            <div>
              <div id="with-other">
                <input type="text" id="other">
              </div>
              <div id="with-focus">
                <input type="text" id="focused" value="abc">
              </div>
            </div>
        `),
    );
    setFocusAndSelection("focused", "b");

    let finalSrc = `
            <div>
              <div id="with-focus">
                <input type="text" id="focused" value="abc">
              </div>
              <div id="with-other">
                <input type="text" id="other">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });
});
