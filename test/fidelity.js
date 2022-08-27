describe("Tests to ensure that idiomorph merges properly", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    function testFidelity(start, end) {
        let initial = make(start);
        let final = make(end);
        Idiomorph.morph(initial, final);
        initial.outerHTML.should.equal(end);
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

    it('morphs children', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div><p>C</p><p>D</p></div>")
    });

    it('morphs white space', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div><p>C</p><p>D</p>  </div>")
    });


})
