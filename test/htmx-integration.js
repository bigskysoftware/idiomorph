describe("Tests for the htmx integration", function () {
  function makeServer() {
    var server = sinon.fakeServer.create();
    htmx.config.defaultSettleDelay = 0;
    server.fakeHTTPMethods = true;
    return server;
  }

  beforeEach(function () {
    this.server = makeServer();
    clearWorkArea();
  });

  afterEach(function () {
    this.server.restore();
  });

  function makeForHtmxTest(htmlStr) {
    let elt = make(htmlStr);
    getWorkArea().appendChild(elt);
    htmx.process(elt);
    return elt;
  }

  it("keeps the element stable in an outer morph", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<button id='b1' hx-swap='morph' hx-get='/test' class='bar'>Foo</button>",
    );
    let initialBtn = makeForHtmxTest(
      "<button id='b1' hx-swap='morph' hx-get='/test'>Foo</button>",
    );
    initialBtn.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(true);
  });

  it("keeps the element live in an outer morph", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<button id='b1' hx-swap='morph' hx-get='/test2' class='bar'>Foo</button>",
    );
    this.server.respondWith(
      "GET",
      "/test2",
      "<button id='b1' hx-swap='morph' hx-get='/test3' class='doh'>Foo</button>",
    );
    let initialBtn = makeForHtmxTest(
      "<button id='b1' hx-swap='morph' hx-get='/test'>Foo</button>",
    );

    initialBtn.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(true);
    initialBtn.classList.contains("doh").should.equal(false);

    initialBtn.click();
    this.server.respond();
    newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(false);
    initialBtn.classList.contains("doh").should.equal(true);
  });

  it("keeps the element stable in an outer morph w/ explicit syntax", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test' class='bar'>Foo</button>",
    );
    let initialBtn = makeForHtmxTest(
      "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test'>Foo</button>",
    );
    initialBtn.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(true);
  });

  it("keeps the element live in an outer morph w/explicit syntax", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test2' class='bar'>Foo</button>",
    );
    this.server.respondWith(
      "GET",
      "/test2",
      "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test3' class='doh'>Foo</button>",
    );
    let initialBtn = makeForHtmxTest(
      "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test'>Foo</button>",
    );

    initialBtn.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(true);
    initialBtn.classList.contains("doh").should.equal(false);

    initialBtn.click();
    this.server.respond();
    newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(false);
    initialBtn.classList.contains("doh").should.equal(true);
  });

  it("keeps elements stable in an inner morph", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<button id='b1' class='bar'>Foo</button>",
    );
    let div = makeForHtmxTest(
      "<div hx-swap='morph:innerHTML' hx-get='/test'><button id='b1'>Foo</button></div>",
    );
    let initialBtn = document.getElementById("b1");
    div.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(true);
  });

  it("keeps elements stable in an inner morph w/ long syntax", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<button id='b1' class='bar'>Foo</button>",
    );
    let div = makeForHtmxTest(
      "<div hx-swap='morph:{morphStyle:\"innerHTML\"}' hx-get='/test'><button id='b1'>Foo</button></div>",
    );
    let initialBtn = document.getElementById("b1");
    div.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.classList.contains("bar").should.equal(true);
  });

  it("keeps the element stable in an outer morph with oob-swap", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<button id='b1' hx-swap-oob='morph'>Bar</button>",
    );
    let div = makeForHtmxTest(
      "<div hx-get='/test' hx-swap='none'><button id='b1'>Foo</button></div>",
    );
    let initialBtn = document.getElementById("b1");
    div.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.innerHTML.should.equal("Bar");
  });

  /* Currently unable to test innerHTML style oob swaps because oob-swap syntax uses a : which conflicts with morph:innerHTML
  it("keeps the element stable in an inner morph with oob-swap", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<div id='d1' hx-swap-oob='morph:innerHTML'><button id='b1'>Bar</button></button>",
    );
    let div = makeForHtmxTest(
      "<div id='d1' hx-get='/test' hx-swap='none'><button id='b1'>Foo</button></div>",
    );
    let initialBtn = document.getElementById("b1");
    div.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    initialBtn.should.equal(newBtn);
    initialBtn.innerHTML.should.equal("Bar");
  });
  */

  it("keeps the element live in an outer morph when node type changes", function () {
    this.server.respondWith(
      "GET",
      "/test",
      "<div id='b1' hx-swap='morph' hx-get='/test2' class='bar'>Foo</div>",
    );
    this.server.respondWith(
      "GET",
      "/test2",
      "<button id='b1' hx-swap='morph' hx-get='/test3' class='doh'>Foo</button>",
    );
    let initialBtn = makeForHtmxTest(
      "<button id='b1' hx-swap='morph' hx-get='/test'>Foo</button>",
    );

    initialBtn.click();
    this.server.respond();
    let newDiv = document.getElementById("b1");

    newDiv.classList.contains("bar").should.equal(true);
    newDiv.classList.contains("doh").should.equal(false);

    newDiv.click();
    this.server.respond();
    let newBtn = document.getElementById("b1");
    newBtn.classList.contains("bar").should.equal(false);
    newBtn.classList.contains("doh").should.equal(true);
  });
});
