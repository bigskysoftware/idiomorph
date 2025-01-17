describe("Preserves focus where possible", function () {
  setup();

  function assertFocusPreservation(
    before,
    after,
    focusId,
    selection,
    shouldAssertFocusAndSelection = true,
  ) {
    getWorkArea().innerHTML = before;
    setFocusAndSelection(focusId, selection);
    Idiomorph.morph(getWorkArea(), after, {
      morphStyle: "innerHTML",
    });
    getWorkArea().innerHTML.should.equal(after);
    // for when we fall short of the ideal
    // these should be considered TODOs for future improvement
    if (shouldAssertFocusAndSelection) {
      assertFocusAndSelection(focusId, selection);
    }
  }

  it("preserves focus state and outerHTML morphStyle", function () {
    assertFocusPreservation(
      `
      <div>
        <input type="text" id="focused" value="abc">
        <input type="text" id="other">
      </div>`,
      `
      <div>
        <input type="text" id="other">
        <input type="text" id="focused" value="abc">
      </div>`,
      "focused",
      "b",
      false, // skip assertion
    );
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
    assertFocusPreservation(
      `
      <div>
        <a></a>
        <input type="text" id="focused" value="abc">
      </div>`,
      `
      <div>
        <b></b>
        <input type="text" id="focused" value="abc">
      </div>`,
      "focused",
      "b",
    );
  });

  it("preserves focus state when elements are moved to different levels of the DOM", function () {
    assertFocusPreservation(
      `
      <div>
        <input type="text" id="other">
        <div>
          <input type="text" id="focused" value="abc">
        </div>
      </div>`,
      `
      <div>
        <input type="text" id="other">
        <input type="text" id="focused" value="abc">
      </div>`,
      "focused",
      "b",
      false, // skip assertion
    );
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
    assertFocusPreservation(
      `
      <div>
        <input type="text" id="other">
      </div>
      <div>
        <input type="text" id="focused" value="abc">
      </div>`,
      `
      <div>
        <input type="text" id="other">
        <input type="text" id="focused" value="abc">
      </div>`,
      "focused",
      "b",
      false, // skip assertion
    );
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
    assertFocusPreservation(
      `
      <div>
        <div id="left">
          <input type="text" id="focused" value="abc">
        </div>
        <div id="right">
          <input type="text" id="other">
        </div>
      </div>`,
      `
      <div>
        <div id="left">
          <input type="text" id="other">
        </div>
        <div id="right">
          <input type="text" id="focused" value="abc">
        </div>
      </div>`,
      "focused",
      "b",
      false, // skip assertion
    );
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
    assertFocusPreservation(
      `
      <div>
        <div id="with-focus">
          <input type="text" id="focused" value="abc">
        </div>
        <div id="with-other">
          <input type="text" id="other">
        </div>
      </div>`,
      `
      <div>
        <div id="with-other">
          <input type="text" id="other">
        </div>
        <div id="with-focus">
          <input type="text" id="focused" value="abc">
        </div>
      </div>`,
      "focused",
      "b",
      false, // skip assertion
    );
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
    assertFocusPreservation(
      `
      <div>
        <div id="with-other">
          <input type="text" id="other">
        </div>
        <div id="with-focus">
          <input type="text" id="focused" value="abc">
        </div>
      </div>`,
      `
      <div>
        <div id="with-focus">
          <input type="text" id="focused" value="abc">
        </div>
        <div id="with-other">
          <input type="text" id="other">
        </div>
      </div>`,
      "focused",
      "b",
    );
  });

  it("preserves focus state when matching anonymous element is inserted", function () {
    assertFocusPreservation(
      `
      <div>
        <div>
          <input type="text" id="focused" value="abc">
        </div>
      </div>`,
      `
      <div>
        <div></div>
        <div>
          <input type="text" id="focused" value="abc">
        </div>
      </div>`,
      "focused",
      "b",
      false,
    );
    assertFocus("focused");
  });
});
