describe("lifecycle hooks", function () {
  beforeEach(function () {
    clearWorkArea();
  });

  it("calls beforeNodeAdded before a new node is added to the DOM", function () {
    let calls = [];
    let initial = make("<ul><li>A</li></ul>");
    Idiomorph.morph(initial, "<ul><li>A</li><li>B</li></ul>", {
      callbacks: {
        beforeNodeAdded: (node) => {
          calls.push(node.outerHTML);
        },
      },
    });
    initial.outerHTML.should.equal("<ul><li>A</li><li>B</li></ul>");
    calls.should.eql(["<li>B</li>"]);
  });

  it("returning false to beforeNodeAdded prevents adding the node", function () {
    let initial = make("<ul><li>A</li></ul>");
    Idiomorph.morph(initial, "<ul><li>A</li><li>B</li></ul>", {
      callbacks: {
        beforeNodeAdded: (node) => false,
      },
    });
    initial.outerHTML.should.equal("<ul><li>A</li></ul>");
  });

  it("calls afterNodeAdded after a new node is added to the DOM", function () {
    let calls = [];
    let initial = make("<ul><li>A</li></ul>");
    Idiomorph.morph(initial, "<ul><li>A</li><li>B</li></ul>", {
      callbacks: {
        afterNodeAdded: (node) => {
          calls.push(node.outerHTML);
        },
      },
    });
    initial.outerHTML.should.equal("<ul><li>A</li><li>B</li></ul>");
    calls.should.eql(["<li>B</li>"]);
  });

  it("calls beforeNodeMorphed before a node is morphed", function () {
    let calls = [];
    let initial = make(`<ul><li id="a">A</li></ul>`);
    Idiomorph.morph(initial, `<ul><li id="a">B</li></ul>`, {
      callbacks: {
        beforeNodeMorphed: (oldNode, newNode) => {
          calls.push([
            oldNode.outerHTML || oldNode.textContent,
            newNode.outerHTML || newNode.textContent,
          ]);
        },
      },
    });
    initial.outerHTML.should.equal(`<ul><li id="a">B</li></ul>`);
    calls.should.eql([
      [`<ul><li id="a">A</li></ul>`, `<ul><li id="a">B</li></ul>`],
      [`<li id="a">A</li>`, `<li id="a">B</li>`],
      [`A`, `B`],
    ]);
  });

  it("returning false to beforeNodeMorphed prevents morphing the node", function () {
    let initial = make(`<ul name="a"><li name="a" id="a">A</li></ul>`);
    Idiomorph.morph(initial, `<ul name="b"><li name="b" id="a">B</li></ul>`, {
      callbacks: {
        beforeNodeMorphed: (node) => {
          if (node.nodeType === Node.TEXT_NODE) return false;
        },
      },
    });
    initial.outerHTML.should.equal(
      `<ul name="b"><li name="b" id="a">A</li></ul>`,
    );
  });

  it("calls afterNodeMorphed before a node is morphed", function () {
    let calls = [];
    let initial = make(`<ul><li id="a">A</li></ul>`);
    Idiomorph.morph(initial, `<ul><li id="a">B</li></ul>`, {
      callbacks: {
        afterNodeMorphed: (oldNode, newNode) => {
          calls.push([
            oldNode.outerHTML || oldNode.textContent,
            newNode.outerHTML || newNode.textContent,
          ]);
        },
      },
    });
    initial.outerHTML.should.equal(`<ul><li id="a">B</li></ul>`);
    calls.should.eql([
      [`B`, `B`],
      [`<li id="a">B</li>`, `<li id="a">B</li>`],
      [`<ul><li id="a">B</li></ul>`, `<ul><li id="a">B</li></ul>`],
    ]);
  });

  it("calls beforeNodeRemoved before a node is removed from the DOM", function () {
    let calls = [];
    let initial = make("<ul><li>A</li><li>B</li></ul>");
    Idiomorph.morph(initial, "<ul><li>A</li></ul>", {
      callbacks: {
        beforeNodeRemoved: (node) => {
          calls.push(node.outerHTML);
        },
      },
    });
    initial.outerHTML.should.equal("<ul><li>A</li></ul>");
    calls.should.eql(["<li>B</li>"]);
  });

  it("returning false to beforeNodeRemoved prevents removing the node", function () {
    let initial = make("<ul><li>A</li><li>B</li></ul>");
    Idiomorph.morph(initial, "<ul><li>A</li></ul>", {
      callbacks: {
        beforeNodeRemoved: (node) => false,
      },
    });
    initial.outerHTML.should.equal("<ul><li>A</li><li>B</li></ul>");
  });

  it("returning false to beforeNodeRemoved prevents removing the node with removed elemnt next to relocated id element", function () {
    let initial = make(`<div><div><a id="a">A</a></div><div><b id="b">B</b><input type="checkbox" data-preserve-me="true" id="preserve-me"></div></div>`);
    Idiomorph.morph(initial, `<div><div><a id="a">A</a><b id="b">B</b></div></div>`, {
      callbacks: {
        beforeNodeRemoved: (node) => false,
      },
    });
    initial.outerHTML.should.equal(`<div><div><a id="a">A</a><b id="b">B</b></div><div><input type="checkbox" data-preserve-me="true" id="preserve-me"></div></div>`);
  });

  it("returning false to beforeNodeRemoved prevents removing the node with different tag types", function () {
    let initial = make("<div><a>A</a><b>B</b><c>C</c></div>");
    Idiomorph.morph(initial, "<div><b>B</b></div>", {
      callbacks: {
        beforeNodeRemoved: (node) => false,
      },
    });
    initial.outerHTML.should.equal("<div><a>A</a><b>B</b><c>C</c></div>");
  });

  it("calls afterNodeRemoved after a node is removed from the DOM", function () {
    let calls = [];
    let initial = make("<ul><li>A</li><li>B</li></ul>");
    Idiomorph.morph(initial, "<ul><li>A</li></ul>", {
      callbacks: {
        afterNodeRemoved: (node) => {
          calls.push(node.outerHTML);
        },
      },
    });
    initial.outerHTML.should.equal("<ul><li>A</li></ul>");
    calls.should.eql(["<li>B</li>"]);
  });

  it("calls beforeAttributeUpdated when an attribute is added", function () {
    let calls = [];
    let initial = make("<a></a>");
    Idiomorph.morph(initial, `<a href="#"></a>`, {
      callbacks: {
        beforeAttributeUpdated: (attributeName, node, mutationType) => {
          calls.push([attributeName, node.outerHTML, mutationType]);
        },
      },
    });
    initial.outerHTML.should.equal(`<a href="#"></a>`);
    calls.should.eql([["href", `<a></a>`, "update"]]);
  });

  it("calls beforeAttributeUpdated when an attribute is updated", function () {
    let calls = [];
    let initial = make(`<a href="a"></a>`);
    Idiomorph.morph(initial, `<a href="b"></a>`, {
      callbacks: {
        beforeAttributeUpdated: (attributeName, node, mutationType) => {
          calls.push([attributeName, node.outerHTML, mutationType]);
        },
      },
    });
    initial.outerHTML.should.equal(`<a href="b"></a>`);
    calls.should.eql([["href", `<a href="a"></a>`, "update"]]);
  });

  it("calls beforeAttributeUpdated when an attribute is removed", function () {
    let calls = [];
    let initial = make(`<a href="#"></a>`);
    Idiomorph.morph(initial, `<a></a>`, {
      callbacks: {
        beforeAttributeUpdated: (attributeName, node, mutationType) => {
          calls.push([attributeName, node.outerHTML, mutationType]);
        },
      },
    });
    initial.outerHTML.should.equal(`<a></a>`);
    calls.should.eql([["href", `<a href="#"></a>`, "remove"]]);
  });

  it("returning false to beforeAttributeUpdated prevents the attribute addition", function () {
    let initial = make("<a></a>");
    Idiomorph.morph(initial, `<a href="#"></a>`, {
      callbacks: {
        beforeAttributeUpdated: () => false,
      },
    });
    initial.outerHTML.should.equal(`<a></a>`);
  });

  it("returning false to beforeAttributeUpdated prevents the attribute update", function () {
    let initial = make(`<a href="a"></a>`);
    Idiomorph.morph(initial, `<a href="b"></a>`, {
      callbacks: {
        beforeAttributeUpdated: () => false,
      },
    });
    initial.outerHTML.should.equal(`<a href="a"></a>`);
  });

  it("returning false to beforeAttributeUpdated prevents the attribute removal", function () {
    let initial = make(`<a href="#"></a>`);
    Idiomorph.morph(initial, `<a></a>`, {
      callbacks: {
        beforeAttributeUpdated: () => false,
      },
    });
    initial.outerHTML.should.equal(`<a href="#"></a>`);
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
