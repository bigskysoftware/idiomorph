describe("Tests to ensure inner and outer morphing works properly", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    it('morphs outerHTML as content properly when argument is single node', function()
    {
        let initial = make("<button>Foo</button>");
        let finalSrc = "<button>Bar</button>";
        let final = make(finalSrc);
        Idiomorph.morph(initial, final, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
    });

    it('morphs outerHTML as content properly when argument is string', function()
    {
        let initial = make("<button>Foo</button>");
        let finalSrc = "<button>Bar</button>";
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
    });

    it('morphs outerHTML as content properly when argument is an HTMLElementCollection', function()
    {
        let initial = make("<button>Foo</button>");
        let finalSrc = "<div><button>Bar</button></div>";
        let final = make(finalSrc).children;
        Idiomorph.morph(initial, final, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
    });

    it('morphs outerHTML as content properly when argument is an Array', function()
    {
        let initial = make("<button>Foo</button>");
        let finalSrc = "<div><button>Bar</button></div>";
        let final = [...make(finalSrc).children];
        Idiomorph.morph(initial, final, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
    });

    it('morphs outerHTML as content properly when argument is HTMLElementCollection with siblings', function()
    {
        let parent = make("<div><button>Foo</button></div>");
        let initial = parent.querySelector("button");
        let finalSrc = "<p>Foo</p><button>Bar</button><p>Bar</p>";
        let final = makeElements(finalSrc);
        Idiomorph.morph(initial, final, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
        initial.parentElement.innerHTML.should.equal("<p>Foo</p><button>Bar</button><p>Bar</p>");
    });

    it('morphs outerHTML as content properly when argument is an Array with siblings', function()
    {
        let parent = make("<div><button>Foo</button></div>");
        let initial = parent.querySelector("button");
        let finalSrc = "<p>Foo</p><button>Bar</button><p>Bar</p>";
        let final = [...makeElements(finalSrc)];
        Idiomorph.morph(initial, final, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
        initial.parentElement.innerHTML.should.equal("<p>Foo</p><button>Bar</button><p>Bar</p>");
    });

    it('morphs outerHTML as content properly when argument is string', function()
    {
        let parent = make("<div><button>Foo</button></div>");
        let initial = parent.querySelector("button");
        let finalSrc = "<p>Foo</p><button>Bar</button><p>Bar</p>";
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
        initial.parentElement.innerHTML.should.equal("<p>Foo</p><button>Bar</button><p>Bar</p>");
    });

    it('morphs innerHTML as content properly when argument is single node', function()
    {
        let initial = make("<div>Foo</div>");
        let finalSrc = "<button>Bar</button>";
        let final = make(finalSrc);
        Idiomorph.morph(initial, final, {morphStyle:'innerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<div><button>Bar</button></div>");
    });

    it('morphs innerHTML as content properly when argument is string', function()
    {
        let initial = make("<button>Foo</button>");
        let finalSrc = "<button>Bar</button>";
        Idiomorph.morph(initial, finalSrc, {morphStyle:'innerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button><button>Bar</button></button>");
    });

    it('morphs innerHTML as content properly when argument is an HTMLElementCollection', function()
    {
        let initial = make("<button>Foo</button>");
        let finalSrc = "<div><button>Bar</button></div>";
        let final = make(finalSrc).children;
        Idiomorph.morph(initial, final, {morphStyle:'innerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button><button>Bar</button></button>");
    });

    it('morphs innerHTML as content properly when argument is an Array', function()
    {
        let initial = make("<button>Foo</button>");
        let finalSrc = "<div><button>Bar</button></div>";
        let final = [...make(finalSrc).children];
        Idiomorph.morph(initial, final, {morphStyle:'innerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button><button>Bar</button></button>");
    });

})
