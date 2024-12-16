describe("Tests for the htmx integration", function() {

    function makeServer(){
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
        let elt = make(htmlStr)
        getWorkArea().appendChild(elt);
        htmx.process(elt);
        return elt;
    }

    it('keeps the element stable in an outer morph', function () {
        this.server.respondWith("GET", "/test", "<button id='b1' hx-swap='morph' hx-get='/test' class='bar'>Foo</button>");
        let initialBtn = makeForHtmxTest("<button id='b1' hx-swap='morph' hx-get='/test'>Foo</button>");
        initialBtn.click();
        this.server.respond();
        let newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(true);
    });

    it('keeps the element live in an outer morph', function () {
        this.server.respondWith("GET", "/test", "<button id='b1' hx-swap='morph' hx-get='/test2' class='bar'>Foo</button>");
        this.server.respondWith("GET", "/test2", "<button id='b1' hx-swap='morph' hx-get='/test3' class='doh'>Foo</button>");
        let initialBtn = makeForHtmxTest("<button id='b1' hx-swap='morph' hx-get='/test'>Foo</button>");

        initialBtn.click();
        this.server.respond();
        let newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(true);
        initialBtn.classList.contains('doh').should.equal(false);

        initialBtn.click();
        this.server.respond();
        newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(false);
        initialBtn.classList.contains('doh').should.equal(true);
    });

    it('keeps the element stable in an outer morph w/ explicit syntax', function () {
        this.server.respondWith("GET", "/test", "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test' class='bar'>Foo</button>");
        let initialBtn = makeForHtmxTest("<button id='b1' hx-swap='morph:outerHTML' hx-get='/test'>Foo</button>");
        initialBtn.click();
        this.server.respond();
        let newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(true);
    });

    it('keeps the element live in an outer morph w/explicit syntax', function () {
        this.server.respondWith("GET", "/test", "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test2' class='bar'>Foo</button>");
        this.server.respondWith("GET", "/test2", "<button id='b1' hx-swap='morph:outerHTML' hx-get='/test3' class='doh'>Foo</button>");
        let initialBtn = makeForHtmxTest("<button id='b1' hx-swap='morph:outerHTML' hx-get='/test'>Foo</button>");

        initialBtn.click();
        this.server.respond();
        let newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(true);
        initialBtn.classList.contains('doh').should.equal(false);

        initialBtn.click();
        this.server.respond();
        newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(false);
        initialBtn.classList.contains('doh').should.equal(true);
    });

    it('keeps elements stable in an inner morph', function () {
        this.server.respondWith("GET", "/test", "<button id='b1' class='bar'>Foo</button>");
        let div = makeForHtmxTest("<div hx-swap='morph:innerHTML' hx-get='/test'><button id='b1'>Foo</button></div>");
        let initialBtn = document.getElementById('b1');
        div.click();
        this.server.respond();
        let newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(true);
    });

    it('keeps elements stable in an inner morph w/ long syntax', function () {
        this.server.respondWith("GET", "/test", "<button id='b1' class='bar'>Foo</button>");
        let div = makeForHtmxTest("<div hx-swap='morph:{morphStyle:\"innerHTML\"}' hx-get='/test'><button id='b1'>Foo</button></div>");
        let initialBtn = document.getElementById('b1');
        div.click();
        this.server.respond();
        let newBtn = document.getElementById('b1');
        initialBtn.should.equal(newBtn);
        initialBtn.classList.contains('bar').should.equal(true);
    });

    it('plays nice with hx-preserve', function() {
        this.server.respondWith("GET", "/test", "<div><input id='input' hx-preserve><button id='b1' hx-swap='morph' hx-get='/test'>Foo</button><div>");
        let html = makeForHtmxTest("<div><input id='input' hx-preserve value='preserve-me!'><button id='b1' hx-swap='morph' hx-get='/test'>Foo</button><div>");
        let button = document.getElementById('b1');
        button.click();
        this.server.respond();
        let input = document.getElementById('input');
        input.value.should.equal('preserve-me!');
    });

    it('plays nice with swapping preserved inputs', function() {
        this.server.respondWith("GET", "/test", `
          <div>
            <input id='second' hx-preserve>
            <input id='first' hx-preserve>
            <button id='b1' hx-swap='morph' hx-get='/test'>Swap</button>
          <div>
        `);
        let html = makeForHtmxTest(`
          <div>
            <input id='first' hx-preserve>
            <input id='second' hx-preserve>
            <button id='b1' hx-swap='morph' hx-get='/test'>Swap</button>
          <div>
        `);
        document.getElementById('first').value = 'preserve first!';
        document.getElementById('second').value = 'preserve second!';
        let button = document.getElementById('b1');
        button.click();
        this.server.respond();
        Array.from(html.querySelectorAll("input")).map(e => e.value).should.eql(['preserve second!', 'preserve first!']);
    });

    it('plays nice with swapping preserved textareas', function() {
        this.server.respondWith("GET", "/test", `
          <div>
            <textarea id='second' hx-preserve></textarea>
            <textarea id='first' hx-preserve></textarea>
            <button id='b1' hx-swap='morph' hx-get='/test'>Swap</button>
          <div>
        `);
        let html = makeForHtmxTest(`
          <div>
            <textarea id='first' hx-preserve></textarea>
            <textarea id='second' hx-preserve></textarea>
            <button id='b1' hx-swap='morph' hx-get='/test'>Swap</button>
          <div>
        `);
        document.getElementById('first').innerHTML = 'preserve first!';
        document.getElementById('second').innerHTML = 'preserve second!';
        let button = document.getElementById('b1');
        button.click();
        this.server.respond();
        Array.from(html.querySelectorAll("textarea")).map(e => e.value).should.eql(['preserve second!', 'preserve first!']);
    });
})
