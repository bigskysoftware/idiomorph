describe("Option to forcibly restore focus after morph", function () {
  setup();

  it("restores focus and selection state with and outerHTML morphStyle", function () {
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
    Idiomorph.morph(div, finalSrc, {
      morphStyle: "outerHTML",
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state when elements are moved to different levels of the DOM", function () {
    getWorkArea().innerHTML = `
      <div>
        <input type="text" id="other">
        <div>
          <input type="text" id="focused" value="abc">
        </div>
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
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state when elements are moved between different containers", function () {
    getWorkArea().innerHTML = `
      <div>
        <div id="left">
          <input type="text" id="focused" value="abc">
        </div>
        <div id="right">
          <input type="text" id="other">
        </div>
      </div>
    `;
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
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state when parents are reorderd", function () {
    getWorkArea().innerHTML = `
      <div>
        <div id="left">
          <input type="text" id="focused" value="abc">
        </div>
        <div id="right">
          <input type="text" id="other">
        </div>
      </div>
    `;
    setFocusAndSelection("focused", "b");

    let finalSrc = `
      <div>
        <div id="right">
          <input type="text" id="other">
        </div>
        <div id="left">
          <input type="text" id="focused" value="abc">
        </div>
      </div>
    `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state with restoreFocus option and outerHTML morphStyle", function () {
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
    Idiomorph.morph(div, finalSrc, {
      morphStyle: "outerHTML",
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state with restoreFocus option when elements are moved to different levels of the DOM", function () {
    getWorkArea().innerHTML = `
      <div>
        <input type="text" id="other">
        <div>
          <input type="text" id="focused" value="abc">
        </div>
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
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state with restoreFocus option when elements are moved between different containers", function () {
    getWorkArea().innerHTML = `
      <div>
        <div id="left">
          <input type="text" id="focused" value="abc">
        </div>
        <div id="right">
          <input type="text" id="other">
        </div>
      </div>
    `;
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
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state with restoreFocus option when parents are reordered", function () {
    getWorkArea().innerHTML = `
      <div>
        <div id="left">
          <input type="text" id="focused" value="abc">
        </div>
        <div id="right">
          <input type="text" id="other">
        </div>
      </div>
    `;
    setFocusAndSelection("focused", "b");

    let finalSrc = `
      <div>
        <div id="right">
          <input type="text" id="other">
        </div>
        <div id="left">
          <input type="text" id="focused" value="abc">
        </div>
      </div>
    `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("restores focus and selection state with a textarea", function () {
    getWorkArea().innerHTML = `
      <div>
        <textarea id="focused">abc</textarea>
        <textarea id="other"></textarea>
      </div>
    `;
    setFocusAndSelection("focused", "b");

    let finalSrc = `
      <div>
        <textarea id="other"></textarea>
        <textarea id="focused">abc</textarea>
      </div>
    `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertFocusAndSelection("focused", "b");
  });

  it("does nothing if a non input/textarea el is focused", function () {
    getWorkArea().innerHTML = `
      <div>
        <p id="focused"></p>
        <p id="other"></p>
      </div>
    `;
    setFocus("focused");

    let finalSrc = `
      <div>
        <p id="other"></p>
        <p id="focused"></p>
      </div>
    `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
      restoreFocus: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    assertNoFocus();
  });
});
