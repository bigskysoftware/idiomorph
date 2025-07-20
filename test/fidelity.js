describe("Tests to ensure that idiomorph merges properly", function () {
  setup();

  function testFidelity(start, end) {
    getWorkArea().innerHTML = start;
    let startElement = getWorkArea().firstElementChild;
    let ret = Idiomorph.morph(startElement, end);
    getWorkArea().innerHTML.should.equal(end);
    ret.map((e) => e.outerHTML).should.eql([end]);
  }

  // bootstrap test
  it("morphs text correctly", function () {
    testFidelity("<button>Foo</button>", "<button>Bar</button>");
  });

  it("morphs attributes correctly", function () {
    testFidelity(
      '<button class="foo">Foo</button>',
      '<button class="bar">Foo</button>',
    );
  });

  it("morphs multiple attributes correctly twice", function () {
    const a = `<section class="child">A</section>`;
    const b = `<section class="thing" data-one="1" data-two="2" data-three="3" data-four="4" fizz="buzz" foo="bar">B</section>`;
    const expectedA = make(a);
    const expectedB = make(b);
    const initial = make(a);

    Idiomorph.morph(initial, expectedB);
    initial.outerHTML.should.equal(b);

    Idiomorph.morph(initial, expectedA);
    initial.outerHTML.should.equal(a);
  });

  it("morphs children", function () {
    testFidelity("<div><p>A</p><p>B</p></div>", "<div><p>C</p><p>D</p></div>");
  });

  it("morphs white space", function () {
    testFidelity(
      "<div><p>A</p><p>B</p></div>",
      "<div><p>C</p><p>D</p>  </div>",
    );
  });

  it("drops content", function () {
    testFidelity("<div><p>A</p><p>B</p></div>", "<div></div>");
  });

  it("adds content", function () {
    testFidelity("<div></div>", "<div><p>A</p><p>B</p></div>");
  });

  it("should morph a node", function () {
    testFidelity("<p>hello world</p>", "<p>hello you</p>");
  });

  it("should stay same if same", function () {
    testFidelity("<p>hello world</p>", "<p>hello world</p>");
  });

  it("should replace a node", function () {
    testFidelity(
      "<main><p>hello world</p></main>",
      "<main><div>hello you</div></main>",
    );
  });

  it("should wrap an IDed node", function () {
    testFidelity(`<hr id="a">`, `<div><hr id="a"></div>`);
  });

  it("should wrap an anonymous node", function () {
    testFidelity(`<hr>`, `<div><hr></div>`);
  });

  it("should append a node", function () {
    testFidelity("<main></main>", "<main><p>hello you</p></main>");
  });

  it("moves a node from the future", function () {
    testFidelity(
      `<div><div id="container"><div id="item"></div></div></div>`,
      `<div><div id="item"></div><div id="container"></div></div>`,
    );
  });

  it("move id node into div does not break insertion point", function () {
    // bug: https://github.com/bigskysoftware/idiomorph/pull/99
    // when moving an IDed element into an inner div, moveBeforeById can
    // move the parent's insertionPoint node, causing an incorrect morph result
    testFidelity(
      `<div><input id="first"></div>`,
      `<div><div><input id="first"></div></div>`,
    );
  });

  it("move id node into div that has been restored from pantry does not break insertion point", function () {
    // bug: https://github.com/bigskysoftware/idiomorph/pull/99
    // after restoring a node from the pantry, if its next sibling gets moved into it
    // via moveBeforeById, thats the current insertionPoint, thus an incorrect morph
    testFidelity(
      `<div><a id="a"></a><br><b id="b"></b></div>`,
      `<div><br><a id="a"><b id="b"></b></a></div>`,
    );
  });

  it("issue https://github.com/bigskysoftware/idiomorph/issues/11", function () {
    let el1 = make('<fieldset id="el"></fieldset>');

    el1.classList.add("foo");
    el1.disabled = true;

    // Also fails (reorder setting class and disabling)
    // el1.disabled = true;
    // el1.classList.add('foo');

    // Also fails (add and remove class)
    // el1.classList.add('foo');
    // el1.classList.remove('foo');
    // el1.disabled = true;

    let el2 = make('<fieldset id="el">hello</fieldset>');

    // Act
    Idiomorph.morph(el1, el2);

    // Assert
    should.equal("hello", el1.innerHTML);
    should.equal(0, el1.classList.length);
    should.equal(false, el1.disabled);
  });

  it("issue https://github.com/bigskysoftware/idiomorph/issues/41", function () {
    window.customElements.define(
      "fake-turbo-frame",
      class extends HTMLElement {
        static observedAttributes = ["src"];
        attributeChangedCallback(name, oldValue, newValue) {
          if (name === "src" && oldValue && oldValue !== newValue) {
            this.removeAttribute("complete");
          }
        }
      },
    );

    let element = make(
      '<fake-turbo-frame id="frame" complete="complete" src="https://example.com"></fake-turbo-frame>',
    );
    let finalSrc = '<fake-turbo-frame id="frame"></fake-turbo-frame>';

    Idiomorph.morph(element, finalSrc);

    element.outerHTML.should.equal(finalSrc);
  });

  it("issue https://github.com/bigskysoftware/idiomorph/issues/135", function () {
    // inputs with name="id" make their form's id property unreliable!
    // form.id returns the <input>, not "myForm", breaking idiomorph's element persistence
    let src = `<form id="myForm"><input name="id"></form>`;
    getWorkArea().innerHTML = src;
    let element = getWorkArea().querySelector("form");
    Idiomorph.morph(getWorkArea(), src, { morphStyle: "innerHTML" });
    should.equal(element, getWorkArea().querySelector("form"));
  });
});
