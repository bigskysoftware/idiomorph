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

  it("recognizes newContent as a node even when a child input shadows its properties", function () {
    let parent = make('<div><form><input name="nodeType"></form></div>');
    let final = make(
      '<form><input name="nodeType"><input name="other"></form>',
    );
    Idiomorph.morph(parent, final, { morphStyle: "innerHTML" });
    parent.innerHTML.should.equal(
      '<form><input name="nodeType"><input name="other"></form>',
    );
  });

  it("morphs children of an SVG-namespace template element normally", function () {
    let initial = make("<div><svg><template><g></g></template></svg></div>");
    let finalSrc = "<div><svg><template><rect></rect></template></svg></div>";
    Idiomorph.morph(initial, finalSrc);
    initial.outerHTML.should.equal(finalSrc);
  });

  it("morphs an SVG-namespace template element recreated by id", function () {
    let initial = make(`<div><svg><template id="t">Foo</template></svg></div>`);
    let finalSrc = `<div><section><svg><template id="t">Foo</template></svg></section></div>`;
    Idiomorph.morph(initial, finalSrc);
    initial.outerHTML.should.equal(finalSrc);
  });

  it("does not sync values onto SVG-namespace input and textarea", function () {
    let calls = [];
    let src = "<div><svg><input/><textarea>Foo</textarea></svg></div>";
    Idiomorph.morph(make(src), src, {
      callbacks: {
        beforeAttributeUpdated: (attributeName, node, mutationType) => {
          calls.push([attributeName, node.localName, mutationType]);
        },
      },
    });
    calls.should.eql([]);
  });

  it("morphs non-HTML-namespace head elements normally", function () {
    let parse = (str) =>
      new DOMParser().parseFromString(str, "text/xml").documentElement;
    let initial = parse(
      '<opml><head lang="a"><title>Old</title></head></opml>',
    );
    let final = parse('<opml><head lang="b"><title>New</title></head></opml>');
    Idiomorph.morph(initial.firstChild, final.firstChild, {
      morphStyle: "outerHTML",
    });
    initial.firstChild.getAttribute("lang").should.equal("b");
    initial.firstChild.firstChild.textContent.should.equal("New");
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

  it("morphs outerHTML properly when oldNode is a text node", function () {
    let parent = make("<div>Foo</div>");
    let initial = parent.firstChild;
    Idiomorph.morph(initial, "<button>Bar</button>", {
      morphStyle: "outerHTML",
    });
    parent.innerHTML.should.equal("<button>Bar</button>");
  });

  it("morphs outerHTML properly when oldNode is a comment node", function () {
    let parent = make(
      "<div><p>Before</p><!-- placeholder --><p>After</p></div>",
    );
    let initial = parent.childNodes[1];
    Idiomorph.morph(initial, "<button>Bar</button>", {
      morphStyle: "outerHTML",
    });
    parent.innerHTML.should.equal(
      "<p>Before</p><button>Bar</button><p>After</p>",
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

  it("errors on innerHTML of a node that cannot have children", function () {
    (() => {
      Idiomorph.morph(make("<div>Foo</div>").firstChild, [], {
        morphStyle: "innerHTML",
      });
    }).should.throw("Cannot morph the innerHTML of a #text node");
  });

  it("errors on bad head style", function () {
    (() => {
      Idiomorph.morph(make("<p>"), [], { head: { style: "magic" } });
    }).should.throw("Do not understand how to morph head style magic");
  });

  it("treats a missing head style as the default", function () {
    let initial = parseHTML("<html><head><title>Foo</title></head></html>");
    Idiomorph.morph(initial, "<html><head><title>Bar</title></head></html>", {
      head: { style: undefined },
    });
    initial.head.innerHTML.should.equal("<title>Bar</title>");
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

  it("can handle ids containing selector syntax", function () {
    let initial = make(`<div><hr id='a"b\\c'></div>`);
    let hr = initial.querySelector("hr");
    Idiomorph.morph(initial, `<div><div><hr id='a"b\\c'></div></div>`);
    initial.querySelector("hr").should.equal(hr);
  });

  it("can handle empty ids", function () {
    let initial = make(`<div><span id="">Foo</span><hr id="a"></div>`);
    let finalSrc = `<div><hr id="a"><span id="">Bar</span></div>`;
    Idiomorph.morph(initial, finalSrc);
    initial.outerHTML.should.equal(finalSrc);
  });

  it("can morph a form whose controls shadow element properties", function () {
    getWorkArea().innerHTML = `<div id="left"><form id="f"><input name="id"></form></div><div id="right"></div>`;
    let form = getWorkArea().querySelector("form");
    Idiomorph.morph(
      getWorkArea(),
      `<div id="left"></div><div id="right"><form id="f"><input name="id"></form></div>`,
      { morphStyle: "innerHTML" },
    );
    getWorkArea().querySelector("form").should.equal(form);
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

  it("can morph a full document with a doctype", function () {
    let initial = parseHTML("<!DOCTYPE html><html><body>Foo</body></html>");
    let finalSrc = "<html><head></head><body>Bar</body></html>";
    Idiomorph.morph(initial, "<!DOCTYPE html>" + finalSrc);
    initial.documentElement.outerHTML.should.equal(finalSrc);
  });

  it("can morph head and body content with a doctype", function () {
    let initial = parseHTML("<!DOCTYPE html><html><body>Foo</body></html>");
    Idiomorph.morph(
      initial.documentElement,
      "<!DOCTYPE html><body>Bar</body>",
      {
        morphStyle: "innerHTML",
      },
    );
    initial.body.innerHTML.should.equal("Bar");
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

  it("preserves the namespace of an added namespaced attribute", function () {
    let initial = make("<svg><use></use></svg>");

    Idiomorph.morph(initial, '<svg><use xlink:href="#foo"></use></svg>');

    initial
      .querySelector("use")
      .getAttributeNS("http://www.w3.org/1999/xlink", "href")
      .should.equal("#foo");
  });

  it("morphs attribute names that the parser accepts but setAttribute rejects", function () {
    let initial = make('<div @click="a"></div>');

    Idiomorph.morph(initial, '<div @click="b" @change="c"></div>');

    initial.getAttribute("@click").should.equal("b");
    initial.getAttribute("@change").should.equal("c");
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

  it("can morph input value properly because value property is special and doesnt reflect", function () {
    let initial = make('<div><input value="foo"></div>');
    let final = make('<input value="foo">');
    final.value = "bar";
    Idiomorph.morph(initial, final, { morphStyle: "innerHTML" });
    initial.innerHTML.should.equal('<input value="bar">');
  });

  it("can morph textarea value properly because value property is special and doesnt reflect", function () {
    let initial = make("<textarea>foo</textarea>");
    let final = make("<textarea>foo</textarea>");
    final.value = "bar";
    Idiomorph.morph(initial, final, { morphStyle: "outerHTML" });
    initial.value.should.equal("bar");
  });

  it("specially considers textarea value property in beforeAttributeUpdated hook because value property is special and doesnt reflect", function () {
    let initial = make("<div><textarea>foo</textarea></div>");
    let final = make("<textarea>foo</textarea>");
    final.value = "bar";
    Idiomorph.morph(initial, final, {
      morphStyle: "innerHTML",
      callbacks: {
        beforeAttributeUpdated: (attr, to, updatetype) => false,
      },
    });
    initial.innerHTML.should.equal("<textarea>foo</textarea>");
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

  it("can morph <select> remove selected option properly", function () {
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
    Idiomorph.morph(parent, finalSrc, { morphStyle: "innerHTML" });
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

  it("preserves the svg namespace when recreating a node with persistent ids", function () {
    let initial = make("<div><svg><circle id='c'/></svg></div>");
    Idiomorph.morph(
      initial,
      "<div><section><svg><circle id='c'/></svg></section></div>",
    );
    initial
      .querySelector("svg")
      .namespaceURI.should.equal("http://www.w3.org/2000/svg");
  });

  it("does not uppercase html elements recreated with persistent ids", function () {
    let initial = make("<div><p id='p'>Foo</p></div>");
    Idiomorph.morph(initial, "<div><section><p id='p'>Foo</p></section></div>");
    initial.outerHTML.should.equal(
      '<div><section><p id="p">Foo</p></section></div>',
    );
  });

  describe("duplicate id warnings", function () {
    let warn;

    beforeEach(function () {
      warn = sinon.stub(console, "warn");
    });

    afterEach(function () {
      warn.restore();
    });

    it("warns when the old content has duplicate ids", function () {
      let initial = make("<div><p id='a'>Foo</p><p id='a'>Bar</p></div>");
      Idiomorph.morph(initial, "<div><p id='a'>Baz</p></div>");
      warn.calledOnce.should.equal(true);
      warn.firstCall.args[1].should.eql(["a"]);
    });

    it("warns when the new content has duplicate ids", function () {
      let initial = make("<div><p id='a'>Foo</p></div>");
      Idiomorph.morph(initial, "<div><p id='a'>Bar</p><p id='a'>Baz</p></div>");
      warn.calledOnce.should.equal(true);
      warn.firstCall.args[1].should.eql(["a"]);
    });

    it("reports every duplicated id", function () {
      let initial = make(
        "<div><p id='a'>Foo</p><p id='a'>Bar</p><p id='b'>Baz</p><p id='b'>Qux</p></div>",
      );
      Idiomorph.morph(initial, "<div><p id='a'>Foo</p><p id='b'>Baz</p></div>");
      warn.firstCall.args[1].should.eql(["a", "b"]);
    });

    it("warns when duplicate ids are on forms whose controls shadow id", function () {
      let initial = make(
        "<div><form id='a'><input name='id'></form><form id='a'><input name='id'></form></div>",
      );
      Idiomorph.morph(
        initial,
        "<div><form id='a'><input name='id'></form></div>",
      );
      warn.calledOnce.should.equal(true);
      warn.firstCall.args[1].should.eql(["a"]);
    });

    it("does not warn when all ids are unique", function () {
      let initial = make("<div><p id='a'>Foo</p><p id='b'>Bar</p></div>");
      Idiomorph.morph(initial, "<div><p id='a'>Baz</p><p id='b'>Qux</p></div>");
      warn.called.should.equal(false);
    });

    it("does not warn when the content has no ids at all", function () {
      let initial = make("<div><p>Foo</p><p>Bar</p></div>");
      Idiomorph.morph(initial, "<div><p>Baz</p><p>Qux</p></div>");
      warn.called.should.equal(false);
    });
  });

  describe("open dialog elements", function () {
    beforeEach(function () {
      clearWorkArea();
    });

    it("invokes HTMLDialogElement.close when removing [open] attribute", function () {
      let html = "<dialog><h1>Foo</h1></dialog>";
      let dialog = make(html);
      getWorkArea().append(dialog);
      dialog.showModal();
      let close = sinon.spy(dialog, "close");
      Idiomorph.morph(dialog, html);
      dialog.open.should.equal(false, "removes [open] attribute");
      close.calledOnce.should.equal(true, "invokes HTMLDialogElement.close()");
    });

    it("does not invoke HTMLDialogElement.close when cancelling the removal of the [open] attribute", function () {
      let html = "<dialog><h1>Foo</h1></dialog>";
      let dialog = make(html);
      getWorkArea().append(dialog);
      dialog.showModal();
      let close = sinon.spy(dialog, "close");
      Idiomorph.morph(dialog, html, {
        callbacks: {
          beforeAttributeUpdated: (attr, to, updatetype) => false,
        },
      });
      dialog.open.should.equal(true, "retains [open] attribute");
      close.called.should.equal(
        false,
        "does not invoke HTMLDialogElement.close()",
      );
    });
  });
});
