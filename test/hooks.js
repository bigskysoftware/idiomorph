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
});
