describe("Two-pass option for retaining more state", function () {
  setup();

  it("fails to preserve all non-attribute element state with single-pass option", function () {
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
      twoPass: false,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, false]);
  });

  it("preserves all non-attribute element state with two-pass option", function () {
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
      twoPass: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves all non-attribute element state with two-pass option and outerHTML morphStyle", function () {
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
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML", twoPass: true });

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
      twoPass: true,
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
      twoPass: true,
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
      twoPass: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    const states = Array.from(getWorkArea().querySelectorAll("input")).map(
      (e) => e.indeterminate,
    );
    states.should.eql([true, true]);
  });

  it("preserves focus state with two-pass option and outerHTML morphStyle", function () {
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
    Idiomorph.morph(div, finalSrc, { morphStyle: "outerHTML", twoPass: true });

    getWorkArea().innerHTML.should.equal(finalSrc);
    document.activeElement.outerHTML.should.equal(
      document.getElementById("first").outerHTML,
    );
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
      twoPass: true,
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
      twoPass: true,
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
      twoPass: true,
    });

    getWorkArea().innerHTML.should.equal(finalSrc);
    document.activeElement.outerHTML.should.equal(
      document.getElementById("second").outerHTML,
    );
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
      twoPass: true,
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
      twoPass: true,
    });

    document.activeElement.outerHTML.should.equal(
      document.getElementById("focus").outerHTML,
    );
    getWorkArea().innerHTML.should.equal(finalSrc);
  });

  it("hooks work as expected", function () {
    let beginSrc = `
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `.trim();
    getWorkArea().append(make(beginSrc));

    let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `.trim();

    let wrongHookCalls = [];
    let wrongHookHandler = (name) => {
      return (node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        wrongHookCalls.push([name, node.outerHTML]);
      };
    };

    let calls = [];

    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
      twoPass: true,
      callbacks: {
        beforeNodeAdded: wrongHookHandler("beforeNodeAdded"),
        afterNodeAdded: wrongHookHandler("afterNodeAdded"),
        beforeNodeRemoved: wrongHookHandler("beforeNodeRemoved"),
        afterNodeRemoved: wrongHookHandler("afterNodeRemoved"),
        beforeNodeMorphed: (oldNode, newNode) => {
          if (oldNode.nodeType !== Node.ELEMENT_NODE) return;
          calls.push(["before", oldNode.outerHTML, newNode.outerHTML]);
        },
        afterNodeMorphed: (oldNode, newNode) => {
          if (oldNode.nodeType !== Node.ELEMENT_NODE) return;
          calls.push(["after", oldNode.outerHTML, newNode.outerHTML]);
        },
      },
    });

    getWorkArea().innerHTML.should.equal(finalSrc);

    wrongHookCalls.should.eql([]);
    calls.should.eql([
      ["before", beginSrc, finalSrc],
      [
        "before",
        `<input type="checkbox" id="second">`,
        `<input type="checkbox" id="second">`,
      ],
      [
        "after",
        `<input type="checkbox" id="second">`,
        `<input type="checkbox" id="second">`,
      ],
      [
        "before",
        `<input type="checkbox" id="first">`,
        `<input type="checkbox" id="first">`,
      ],
      [
        "after",
        `<input type="checkbox" id="first">`,
        `<input type="checkbox" id="first">`,
      ],
      [
        "after",
        '<div>\n              <input type="checkbox" id="second">\n              <input type="checkbox" id="first">\n            </div>',
        '<div>\n              <input type="checkbox" id="second">\n              <input type="checkbox" id="first">\n            </div>',
      ],
    ]);
  });

  it("beforeNodeMorphed hook also applies to nodes restored from the pantry", function () {
    getWorkArea().append(
      make(`
            <div>
              <p data-preserve-me="true" id="first">First paragraph</p>
              <p data-preserve-me="true" id="second">Second paragraph</p>
            </div>
        `),
    );
    document.getElementById("first").innerHTML = "First paragraph EDITED";
    document.getElementById("second").innerHTML = "Second paragraph EDITED";

    let finalSrc = `
            <div>
              <p data-preserve-me="true" id="second">Second paragraph</p>
              <p data-preserve-me="true" id="first">First paragraph</p>
            </div>
        `;

    Idiomorph.morph(getWorkArea(), finalSrc, {
      morphStyle: "innerHTML",
      twoPass: true,
      callbacks: {
        // basic implementation of a preserve-me attr
        beforeNodePantried(node) {
          if (node.parentNode?.dataset?.preserveMe) return false;
        },
        beforeNodeMorphed(oldNode, newContent) {
          if (oldNode.dataset?.preserveMe) return false;
        },
      },
    });

    getWorkArea().innerHTML.should.equal(`
            <div>
              <p data-preserve-me="true" id="second">Second paragraph EDITED</p>
              <p data-preserve-me="true" id="first">First paragraph EDITED</p>
            </div>
        `);
  });
});
