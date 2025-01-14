describe("Preserves focus where possible", function () {
  setup();

  it("preserves focus state and outerHTML morphStyle", function () {
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
    if (document.body.moveBefore) {
      document.activeElement.outerHTML.should.equal(
        document.getElementById("first").outerHTML,
      );
    } else {
      // TODO
      document.activeElement.outerHTML.should.equal(document.body.outerHTML);
    }
  });

  it("preserves focus state when previous element is replaced", function () {
    getWorkArea().innerHTML = `
            <div>
              <a></a>
              <input type="text" id="focus">
            </div>
        `;
    document.getElementById("focus").focus();

    let finalSrc = `
            <div>
              <b></b>
              <input type="text" id="focus">
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

  it("preserves focus state when elements are moved to different levels of the DOM", function () {
    getWorkArea().append(
      make(`
            <div>
              <input type="text" id="first">
              <div>
                <input type="text" id="second">
              </div>
            </div>
        `),
    );
    document.getElementById("second").focus();

    let finalSrc = `
            <div>
              <input type="text" id="first">
              <input type="text" id="second">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (document.body.moveBefore) {
      document.activeElement.outerHTML.should.equal(
        document.getElementById("second").outerHTML,
      );
    } else {
      document.activeElement.outerHTML.should.equal(document.body.outerHTML);
      console.log(
        "preserves focus state when elements are moved to different levels of the DOM test needs moveBefore enabled to work properly",
      );
    }
  });

  it("preserves focus state when focused element is moved between anonymous containers", function () {
    getWorkArea().innerHTML = `
            <div>
              <input type="text" id="first">
            </div>
            <div>
              <input type="text" id="second">
            </div>
        `;
    document.getElementById("second").focus();

    let finalSrc = `
            <div>
              <input type="text" id="first">
              <input type="text" id="second">
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (document.body.moveBefore) {
      document.activeElement.outerHTML.should.equal(
        document.getElementById("second").outerHTML,
      );
    } else {
      document.activeElement.outerHTML.should.equal(document.body.outerHTML);
      console.log("needs moveBefore enabled to work properly");
    }
  });

  it("preserves focus state when elements are moved between IDed containers", function () {
    getWorkArea().append(
      make(`
            <div>
              <div id="left">
                <input type="text" id="first">
              </div>
              <div id="right">
                <input type="text" id="second">
              </div>
            </div>
        `),
    );
    document.getElementById("first").focus();

    let finalSrc = `
            <div>
              <div id="left">
                <input type="text" id="second">
              </div>
              <div id="right">
                <input type="text" id="first">
              </div>
            </div>
        `;
    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (document.body.moveBefore) {
      document.activeElement.outerHTML.should.equal(
        document.getElementById("first").outerHTML,
      );
    } else {
      document.activeElement.outerHTML.should.equal(document.body.outerHTML);
      console.log(
        "preserves focus state when elements are moved between IDed containers test needs moveBefore enabled to work properly",
      );
    }
  });

  it("preserves focus state when parents are reordered", function () {
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

    getWorkArea().innerHTML.should.equal(finalSrc);
    if (document.body.moveBefore) {
      document.activeElement.outerHTML.should.equal(
        document.getElementById("focus").outerHTML,
      );
    } else {
      // TODO
      document.activeElement.outerHTML.should.equal(document.body.outerHTML);
    }
  });
});
