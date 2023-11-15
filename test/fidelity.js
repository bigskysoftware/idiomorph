describe("Tests to ensure that idiomorph merges properly", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    function expectFidelity(actual, expected) {
        if (actual.outerHTML !== expected) {
            console.log("HTML after morph: " + actual.outerHTML);
            console.log("Expected:         " + expected);
        }
        actual.outerHTML.should.equal(expected);
    }

    function testFidelity(start, end) {
        let initial = make(start);
        let final = make(end);
        Idiomorph.morph(initial, final);

        expectFidelity(initial, end);
    }

    // bootstrap test
    it('morphs text correctly', function()
    {
        testFidelity("<button>Foo</button>", "<button>Bar</button>")
    });

    it('morphs attributes correctly', function()
    {
        testFidelity("<button class=\"foo\">Foo</button>", "<button class=\"bar\">Foo</button>")
    });

    it('morphs multiple attributes correctly and back', function ()
    {
        const a = `<section class="child">A</section>`;
        const b = `<section class="thing" data-one="1" data-two="2" data-three="3" data-four="4" id="foo" fizz="buzz" foo="bar">B</section>`;
        const expectedA = make(a);
        const expectedB = make(b);
        const initial = make(a);

        Idiomorph.morph(initial, expectedB);
        expectFidelity(initial, b);

        Idiomorph.morph(initial, expectedA);
        expectFidelity(initial, a);
    });

    it('morphs children', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div><p>C</p><p>D</p></div>")
    });

    it('morphs white space', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div><p>C</p><p>D</p>  </div>")
    });

    it('drops content', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div></div>")
    });

    it('adds content', function()
    {
        testFidelity("<div></div>", "<div><p>A</p><p>B</p></div>")
    });

    it('should morph a node', function()
    {
        testFidelity("<p>hello world</p>", "<p>hello you</p>")
    });

    it('should stay same if same', function()
    {
        testFidelity("<p>hello world</p>", "<p>hello world</p>")
    });

    it('should replace a node', function()
    {
        testFidelity("<main><p>hello world</p></main>", "<main><div>hello you</div></main>")
    });

    it('should append a node', function()
    {
        testFidelity("<main></main>", "<main><p>hello you</p></main>")
    });




})
