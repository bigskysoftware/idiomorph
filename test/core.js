describe("Core morphing tests", function () {
  setup();

  it("morphs outerHTML by default", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<button>Bar</button>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML if morphStyle is missing", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<button>Bar</button>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: null });
    initial.outerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML as content properly when argument is null", function () {
    let initial = make("<button>Foo</button>");
    Idiomorph.morph(initial, null, { morphStyle: "outerHTML" });
    initial.isConnected.should.equal(false);
  });

  it("morphs outerHTML as content properly when argument is single node", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<button>Bar</button>";
    let final = make(finalSrc);
    Idiomorph.morph(initial, final, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML as content properly when argument is single node", function () {
    let initial = make("<button>Foo</button>");
    let element = document.createElement("button");
    element.innerText = "Bar";
    Idiomorph.morph(initial, element, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML as content properly when argument is string", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<button>Bar</button>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML as content properly when argument is an HTMLElementCollection", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<div><button>Bar</button></div>";
    let final = make(finalSrc).children;
    Idiomorph.morph(initial, final, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML as content properly when argument is an Array", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<div><button>Bar</button></div>";
    let final = [...make(finalSrc).children];
    Idiomorph.morph(initial, final, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML as content properly when argument is HTMLElementCollection with siblings", function () {
    let parent = make("<div><button>Foo</button></div>");
    let initial = parent.querySelector("button");
    let finalSrc = "<p>Foo</p><button>Bar</button><p>Bar</p>";
    let final = makeElements(finalSrc);
    Idiomorph.morph(initial, final, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
    initial.parentElement.innerHTML.should.equal(
      "<p>Foo</p><button>Bar</button><p>Bar</p>",
    );
  });

  it("morphs outerHTML as content properly when argument is an Array with siblings", function () {
    let parent = make("<div><button>Foo</button></div>");
    let initial = parent.querySelector("button");
    let finalSrc = "<p>Foo</p><button>Bar</button><p>Bar</p>";
    let final = [...makeElements(finalSrc)];
    Idiomorph.morph(initial, final, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
    initial.parentElement.innerHTML.should.equal(
      "<p>Foo</p><button>Bar</button><p>Bar</p>",
    );
  });

  it("morphs outerHTML as content properly when argument is string", function () {
    let parent = make("<div><button>Foo</button></div>");
    let initial = parent.querySelector("button");
    let finalSrc = "<p>Foo</p><button>Bar</button><p>Bar</p>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
    initial.parentElement.innerHTML.should.equal(
      "<p>Foo</p><button>Bar</button><p>Bar</p>",
    );
  });

  it("morphs outerHTML as content properly when argument is string with multiple siblings", function () {
    let parent = make("<div><button>Foo</button></div>");
    let initial = parent.querySelector("button");
    let finalSrc =
      "<p>Doh</p><p>Foo</p><button>Bar</button><p>Bar</p><p>Ray</p>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
    initial.parentElement.innerHTML.should.equal(
      "<p>Doh</p><p>Foo</p><button>Bar</button><p>Bar</p><p>Ray</p>",
    );
  });

  it("morphs outerHTML properly when oldNode has siblings", function () {
    let parent = make(
      "<div><p>Preserve me!</p><button>Foo</button><p>Preserve me too!</p></div>",
    );
    let initial = parent.querySelector("button");
    let finalSrc =
      "<p>Doh</p><p>Foo</p><button>Bar</button><p>Bar</p><p>Ray</p>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<button>Bar</button>");
    initial.parentElement.innerHTML.should.equal(
      "<p>Preserve me!</p><p>Doh</p><p>Foo</p><button>Bar</button><p>Bar</p><p>Ray</p><p>Preserve me too!</p>",
    );
  });

  it("morphs innerHTML as content properly when argument is null", function () {
    let initial = make("<div>Foo</div>");
    Idiomorph.morph(initial, null, { morphStyle: "innerHTML" });
    initial.outerHTML.should.equal("<div></div>");
  });

  it("morphs innerHTML as content properly when argument is single node string", function () {
    let initial = make("<div>Foo</div>");
    let finalSrc = "<button>Bar</button>";
    let final = make(finalSrc);
    Idiomorph.morph(initial, final, { morphStyle: "innerHTML" });
    initial.outerHTML.should.equal("<div><button>Bar</button></div>");
  });

  it("morphs innerHTML as content properly when argument is single node", function () {
    let initial = make("<div>Foo</div>");
    let element = document.createElement("button");
    element.innerText = "Bar";
    Idiomorph.morph(initial, element, { morphStyle: "innerHTML" });
    initial.outerHTML.should.equal("<div><button>Bar</button></div>");
  });

  it("morphs innerHTML as content properly when argument is string", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<button>Bar</button>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: "innerHTML" });
    initial.outerHTML.should.equal("<button><button>Bar</button></button>");
  });

  it("morphs innerHTML as content properly when argument is an HTMLElementCollection", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<div><button>Bar</button></div>";
    let final = make(finalSrc).children;
    Idiomorph.morph(initial, final, { morphStyle: "innerHTML" });
    initial.outerHTML.should.equal("<button><button>Bar</button></button>");
  });

  it("morphs innerHTML as content properly when argument is an Array", function () {
    let initial = make("<button>Foo</button>");
    let finalSrc = "<div><button>Bar</button></div>";
    let final = [...make(finalSrc).children];
    Idiomorph.morph(initial, final, { morphStyle: "innerHTML" });
    initial.outerHTML.should.equal("<button><button>Bar</button></button>");
  });

  it("morphs innerHTML as content properly when argument is empty array", function () {
    let initial = make("<div>Foo</div>");
    Idiomorph.morph(initial, [], { morphStyle: "innerHTML" });
    initial.outerHTML.should.equal("<div></div>");
  });

  it("errors on bad morphStyle", function () {
    (() => {
      Idiomorph.morph(make("<p>"), [], { morphStyle: "magic" });
    }).should.throw("Do not understand how to morph style magic");
  });

  it("can morph a template tag properly", function () {
    let initial = make("<template data-old>Foo</template>");
    let final = make("<template data-new>Bar</template>");
    Idiomorph.morph(initial, final);
    initial.outerHTML.should.equal(final.outerHTML);
  });

  it("can handle numeric ids", function () {
    let initial = make(`<div><hr id="1"></div>`);
    let final = `<div><div><hr id="1"></div></div>`;
    Idiomorph.morph(initial, final);
    initial.outerHTML.should.equal(final);
  });

  it("ignores active element when ignoreActive set to true", function () {
    let initialSource = "<div><div id='d1'>Foo</div><input id='i1'></div>";
    getWorkArea().innerHTML = initialSource;
    let i1 = document.getElementById("i1");
    i1.focus();
    let d1 = document.getElementById("d1");
    i1.value = "asdf";
    let finalSource = "<div><div id='d1'>Bar</div><input id='i1'></div>";
    Idiomorph.morph(getWorkArea(), finalSource, {
      morphStyle: "innerHTML",
      ignoreActive: true,
    });
    d1.innerText.should.equal("Bar");
    i1.value.should.equal("asdf");
  });

  it("can morph a body tag properly", function () {
    let initial = parseHTML("<body>Foo</body>");
    let finalSrc = '<body foo="bar">Foo</body>';
    let final = parseHTML(finalSrc);
    Idiomorph.morph(initial.body, final.body);
    initial.body.outerHTML.should.equal(finalSrc);
  });

  it("can morph a full document properly", function () {
    let initial = parseHTML("<html><body>Foo</body></html>");
    let finalSrc =
      '<html foo="bar"><head></head><body foo="bar">Foo</body></html>';
    Idiomorph.morph(initial, finalSrc);
    initial.documentElement.outerHTML.should.equal(finalSrc);
  });

  it("ignores active input value when ignoreActiveValue is true", function () {
    let parent = make("<div><input value='foo'></div>");
    document.body.append(parent);

    let initial = parent.querySelector("input");

    // morph
    let finalSrc = '<input value="bar">';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input value="bar">');

    initial.focus();

    document.activeElement.should.equal(initial);

    let finalSrc2 = '<input class="foo" value="doh">';
    Idiomorph.morph(initial, finalSrc2, {
      morphStyle: "outerHTML",
      ignoreActiveValue: true,
    });
    initial.value.should.equal("bar");
    initial.classList.value.should.equal("foo");

    document.body.removeChild(parent);
  });

  it("does not ignore body when ignoreActiveValue is true and no element has focus", function () {
    let parent = make("<div><input value='foo'></div>");
    document.body.append(parent);

    let initial = parent.querySelector("input");

    // morph
    let finalSrc = '<input value="bar">';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input value="bar">');

    document.activeElement.should.equal(document.body);

    let finalSrc2 = '<input class="foo" value="doh">';
    Idiomorph.morph(initial, finalSrc2, {
      morphStyle: "outerHTML",
      ignoreActiveValue: true,
    });
    initial.value.should.equal("doh");
    initial.classList.value.should.equal("foo");

    document.body.removeChild(parent);
  });

  it("can ignore attributes w/ the beforeAttributeUpdated callback", function () {
    let parent = make("<div><input value='foo'></div>");
    document.body.append(parent);

    let initial = parent.querySelector("input");

    // morph
    let finalSrc = '<input value="bar">';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input value="bar">');

    let finalSrc2 = '<input class="foo" value="doh">';
    Idiomorph.morph(initial, finalSrc2, {
      morphStyle: "outerHTML",
      callbacks: {
        beforeAttributeUpdated: function (attr) {
          if (attr === "value") {
            return false;
          }
        },
      },
    });
    initial.value.should.equal("bar");
    initial.classList.value.should.equal("foo");

    document.body.removeChild(parent);
  });

  it("can ignore attributes w/ the beforeAttributeUpdated callback 2", function () {
    let parent = make("<div><input value='foo'></div>");
    document.body.append(parent);

    let initial = parent.querySelector("input");

    // morph
    let finalSrc = '<input value="bar">';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input value="bar">');

    let finalSrc2 = '<input class="foo" value="doh">';
    Idiomorph.morph(initial, finalSrc2, {
      morphStyle: "outerHTML",
      callbacks: {
        beforeAttributeUpdated: function (attr) {
          if (attr === "class") {
            return false;
          }
        },
      },
    });
    initial.value.should.equal("doh");
    initial.classList.value.should.equal("");

    document.body.removeChild(parent);
  });

  it("can prevent element addition w/ the beforeNodeAdded callback", function () {
    let parent = make("<div><p>1</p><p>2</p></div>");
    document.body.append(parent);

    // morph
    let finalSrc = "<p>1</p><p>2</p><p>3</p><p>4</p>";

    Idiomorph.morph(parent, finalSrc, {
      morphStyle: "innerHTML",
      callbacks: {
        beforeNodeAdded(node) {
          if (node.outerHTML === "<p>3</p>") return false;
        },
      },
    });
    parent.innerHTML.should.equal("<p>1</p><p>2</p><p>4</p>");

    document.body.removeChild(parent);
  });

  it("ignores active textarea value when ignoreActiveValue is true", function () {
    let parent = make("<div><textarea>foo</textarea></div>");
    document.body.append(parent);
    let initial = parent.querySelector("textarea");

    let finalSrc = "<textarea>bar</textarea>";
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal("<textarea>bar</textarea>");

    initial.focus();

    document.activeElement.should.equal(initial);

    let finalSrc2 = '<textarea class="foo">doh</textarea>';
    Idiomorph.morph(initial, finalSrc2, {
      morphStyle: "outerHTML",
      ignoreActiveValue: true,
    });
    initial.outerHTML.should.equal('<textarea class="foo">bar</textarea>');

    document.body.removeChild(parent);
  });

  it("can morph input value properly because value property is special and doesnt reflect with keepInputValues false", function () {
    let initial = make('<div><input value="foo"></div>');
    let final = make('<input value="foo">');
    final.value = "bar";
    Idiomorph.morph(initial, final, {
      morphStyle: "innerHTML",
      keepInputValues: false,
    });
    initial.innerHTML.should.equal('<input value="bar">');
  });

  it("can morph textarea value properly because value property is special and doesnt reflect with keepInputValues false", function () {
    let initial = make("<textarea>foo</textarea>");
    let final = make("<textarea>foo</textarea>");
    final.value = "bar";
    Idiomorph.morph(initial, final, {
      morphStyle: "outerHTML",
      keepInputValues: false,
    });
    initial.value.should.equal("bar");
  });

  it("specially considers textarea value property in beforeAttributeUpdated hook because value property is special and doesnt reflect", function () {
    let initial = make("<div><textarea>foo</textarea></div>");
    let final = make("<textarea>foo</textarea>");
    final.value = "bar";
    Idiomorph.morph(initial, final, {
      morphStyle: "innerHTML",
      keepInputValues: false,
      callbacks: {
        beforeAttributeUpdated: (attr, to, updatetype) => false,
      },
    });
    initial.innerHTML.should.equal("<textarea>foo</textarea>");
    initial.firstChild.value.should.equal("foo");
  });

  it("can morph textarea value to the same without changing value if keepInputValues true", function () {
    let initial = make("<textarea>foo</textarea>");
    let final = make("<textarea>foo</textarea>");
    initial.value = "bar";
    Idiomorph.morph(initial, final, {
      morphStyle: "outerHTML",
      keepInputValues: true,
    });
    initial.value.should.equal("bar");
  });

  it("can morph textarea value to the same resets value if keepInputValues false", function () {
    let initial = make("<textarea>foo</textarea>");
    let final = make("<textarea>foo</textarea>");
    initial.value = "bar";
    Idiomorph.morph(initial, final, {
      morphStyle: "outerHTML",
      keepInputValues: false,
    });
    initial.value.should.equal("foo");
  });

  it("can morph textarea and updates if changing value if keepInputValues true", function () {
    let initial = make("<textarea>foo</textarea>");
    let final = make("<textarea>foo2</textarea>");
    initial.value = "bar";
    Idiomorph.morph(initial, final, { keepInputValues: true });
    initial.value.should.equal("foo2");
  });

  it("can morph input checked properly, remove checked", function () {
    let parent = make('<div><input type="checkbox" checked></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");

    let finalSrc = '<input type="checkbox">';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input type="checkbox">');
    initial.checked.should.equal(false);
    document.body.removeChild(parent);
  });

  it("can morph input checked properly, add checked", function () {
    let parent = make('<div><input type="checkbox"></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");

    let finalSrc = '<input type="checkbox" checked>';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input type="checkbox" checked="">');
    initial.checked.should.equal(true);
    document.body.removeChild(parent);
  });

  it("can morph input checked properly, set checked property to true", function () {
    let parent = make('<div><input type="checkbox" checked></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");
    initial.checked = false;

    let finalSrc = '<input type="checkbox" checked>';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input type="checkbox" checked="">');
    initial.checked.should.equal(true);
    document.body.removeChild(parent);
  });

  it("can morph input checked properly, set checked property to false", function () {
    let parent = make('<div><input type="checkbox"></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");
    initial.checked = true;

    let finalSrc = '<input type="checkbox">';
    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });
    initial.outerHTML.should.equal('<input type="checkbox">');
    initial.checked.should.equal(false);
    document.body.removeChild(parent);
  });

  it("can morph input checked properly, set checked property to true again if keepInputValues false", function () {
    let parent = make('<div><input type="checkbox" checked></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");
    initial.checked = false;

    let finalSrc = '<input type="checkbox" checked>';
    Idiomorph.morph(initial, finalSrc, { keepInputValues: false });
    initial.outerHTML.should.equal('<input type="checkbox" checked="">');
    initial.checked.should.equal(true);
    document.body.removeChild(parent);
  });

  it("can morph input checked properly, when checked does not reset checkbox state when no change if keepInputValues true", function () {
    let parent = make('<div><input type="checkbox" checked></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");
    initial.checked = false;

    let finalSrc = '<input type="checkbox" checked>';
    Idiomorph.morph(initial, finalSrc, { keepInputValues: true });
    initial.outerHTML.should.equal('<input type="checkbox" checked="">');
    initial.checked.should.equal(false);
    document.body.removeChild(parent);
  });

  it("can morph input checked properly, set checked property to false again if keepInputValues false", function () {
    let parent = make('<div><input type="checkbox"></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");
    initial.checked = true;

    let finalSrc = '<input type="checkbox">';
    Idiomorph.morph(initial, finalSrc, { keepInputValues: false });
    initial.outerHTML.should.equal('<input type="checkbox">');
    initial.checked.should.equal(false);
    document.body.removeChild(parent);
  });

  it("can morph input checked properly, when not checked does not reset checkbox state when no change if keepInputValues true", function () {
    let parent = make('<div><input type="checkbox"></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");
    initial.checked = true;

    let finalSrc = '<input type="checkbox">';
    Idiomorph.morph(initial, finalSrc, { keepInputValues: true });
    initial.outerHTML.should.equal('<input type="checkbox">');
    initial.checked.should.equal(true);
    document.body.removeChild(parent);
  });

  it("can morph <select> remove selected option properly with keepInputValues false old behaviour", function () {
    let parent = make(`
      <div>
        <select>
          <option>0</option>
          <option selected>1</option>
        </select>
      </div>
    `);
    document.body.append(parent);
    let select = parent.querySelector("select");
    let options = parent.querySelectorAll("option");
    select.selectedIndex.should.equal(1);
    Array.from(select.selectedOptions).should.eql([options[1]]);
    Array.from(options)
      .map((o) => o.selected)
      .should.eql([false, true]);

    let finalSrc = `
        <select>
          <option>0</option>
          <option>1</option>
        </select>
      `;
    Idiomorph.morph(parent, finalSrc, {
      morphStyle: "innerHTML",
      keepInputValues: false,
    });
    // FIXME? morph writes different html explicitly selecting first element
    // is this a problem at all?
    parent.innerHTML.should.equal(`
        <select>
          <option selected="">0</option>
          <option>1</option>
        </select>
      `);
    select.selectedIndex.should.equal(0);
    Array.from(select.selectedOptions).should.eql([options[0]]);
    Array.from(options)
      .map((o) => o.selected)
      .should.eql([true, false]);
  });

  it("can morph <select> remove selected option properly if keepInputValues true", function () {
    let parent = make(`
      <div>
        <select>
          <option>0</option>
          <option selected>1</option>
        </select>
      </div>
    `);
    document.body.append(parent);
    let select = parent.querySelector("select");
    let options = parent.querySelectorAll("option");
    select.selectedIndex.should.equal(1);
    Array.from(select.selectedOptions).should.eql([options[1]]);
    Array.from(options)
      .map((o) => o.selected)
      .should.eql([false, true]);

    let finalSrc = `
        <select>
          <option>0</option>
          <option>1</option>
        </select>
      `;
    Idiomorph.morph(parent, finalSrc, {
      morphStyle: "innerHTML",
      keepInputValues: true,
    });
    parent.innerHTML.should.equal(`
        <select>
          <option>0</option>
          <option>1</option>
        </select>
      `);
    select.selectedIndex.should.equal(0);
    Array.from(select.selectedOptions).should.eql([options[0]]);
    Array.from(options)
      .map((o) => o.selected)
      .should.eql([true, false]);
  });

  it("can morph <select> new selected option properly", function () {
    let parent = make(`
      <div>
        <select>
          <option>0</option>
          <option>1</option>
        </select>
      </div>
    `);
    document.body.append(parent);
    let select = parent.querySelector("select");
    let options = parent.querySelectorAll("option");
    select.selectedIndex.should.equal(0);
    Array.from(select.selectedOptions).should.eql([options[0]]);
    Array.from(options)
      .map((o) => o.selected)
      .should.eql([true, false]);

    let finalSrc = `
        <select>
          <option>0</option>
          <option selected="">1</option>
        </select>
      `;
    Idiomorph.morph(parent, finalSrc, { morphStyle: "innerHTML" });
    parent.innerHTML.should.equal(finalSrc);
    select.selectedIndex.should.equal(1);
    Array.from(select.selectedOptions).should.eql([options[1]]);
    Array.from(options)
      .map((o) => o.selected)
      .should.eql([false, true]);
  });

  it("can override defaults w/ global set", function () {
    try {
      // set default to inner HTML
      Idiomorph.defaults.morphStyle = "innerHTML";
      let initial = make("<button>Foo</button>");
      let finalSrc = "<button>Bar</button>";

      // should more inner HTML despite no config
      Idiomorph.morph(initial, finalSrc);

      initial.outerHTML.should.equal("<button><button>Bar</button></button>");
    } finally {
      Idiomorph.defaults.morphStyle = "outerHTML";
    }
  });

  it("can override globally set default w/ local value", function () {
    try {
      // set default to inner HTML
      Idiomorph.defaults.morphStyle = "innerHTML";
      let initial = make("<button>Foo</button>");
      let finalSrc = "<button>Bar</button>";

      // should morph outer HTML despite default setting
      Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });

      initial.outerHTML.should.equal("<button>Bar</button>");
    } finally {
      Idiomorph.defaults.morphStyle = "outerHTML";
    }
  });

  it("add loc coverage for findSoftMatch aborting on two future soft matches", function () {
    // when nodes can't be softMatched because they have different types it will scan ahead
    // but it aborts the scan ahead if it finds two nodes ahead in both the new and old content
    // that softmatch so it can just insert the mis matched node it is on and get to the matching.
    // had no test coverage but not easy to test but at least it is called now.
    let initial = parseHTML("<body><span></span><p></p><p></p></body>");
    let finalSrc = "<body><div></div><p></p><p></p></body>";
    let final = parseHTML(finalSrc);
    Idiomorph.morph(initial.body, final.body);
    initial.body.outerHTML.should.equal(finalSrc);
  });

  it("test pathlogical case of oldNode and newContent both being in the same document with siblings", function () {
    let context = make(`
      <div>
        <p>ignore me</p>
        <div>hello</div>
        <div>world</div>
        <p>ignore me</p>
      </div>
    `);

    let [initial, final] = context.querySelectorAll("div");
    let ret = Idiomorph.morph(initial, final);
    initial.outerHTML.should.equal(final.outerHTML);
    ret.map((e) => e.outerHTML).should.eql([final.outerHTML]);
    context.outerHTML.should.equal(
      `
      <div>
        <p>ignore me</p>
        <div>world</div>
        <div>world</div>
        <p>ignore me</p>
      </div>
    `.trim(),
    );
  });

  it("do not build id in new content parent into persistent id set", function () {
    let initial = make("<span><div id='a'>Foo</div></span>");
    let finalParent = make("<div id='a'><span>Bar</span></div>");
    let finalSrc = finalParent.querySelector("span");

    Idiomorph.morph(initial, finalSrc, { morphStyle: "outerHTML" });

    // have to make sure the id located in the parent of the new content is not
    // included in the persistent ID set or it will pantry the id'ed node in error
    initial.outerHTML.should.equal("<span>Bar</span>");
  });

  it("updates input when value attribute changes even with user input with keepInputValues true", function () {
    let parent = make('<div><input value="foo"></div>');
    document.body.append(parent);
    let initial = parent.querySelector("input");

    initial.value = "userTyped";

    let finalSrc = '<input value="newServerValue">';
    Idiomorph.morph(initial, finalSrc, {
      morphStyle: "outerHTML",
      keepInputValues: true,
    });

    initial.value.should.equal("newServerValue");
    initial.getAttribute("value").should.equal("newServerValue");

    document.body.removeChild(parent);
  });
});
