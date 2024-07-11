describe("Core morphing tests", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    it('morphs outerHTML as content properly when argument is null', function()
    {
        let initial = make("<button>Foo</button>");
        Idiomorph.morph(initial, null, {morphStyle:'outerHTML'});
        initial.isConnected.should.equal(false);
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

    it('morphs outerHTML as content properly when argument is string with multiple siblings', function()
    {
        let parent = make("<div><button>Foo</button></div>");
        let initial = parent.querySelector("button");
        let finalSrc = "<p>Doh</p><p>Foo</p><button>Bar</button><p>Bar</p><p>Ray</p>";
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== "<button>Bar</button>") {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal("<button>Bar</button>");
        initial.parentElement.innerHTML.should.equal("<p>Doh</p><p>Foo</p><button>Bar</button><p>Bar</p><p>Ray</p>");
    });

    it('morphs innerHTML as content properly when argument is null', function()
    {
        let initial = make("<div>Foo</div>");
        Idiomorph.morph(initial, null, {morphStyle:'innerHTML'});
        initial.outerHTML.should.equal("<div></div>");
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

    it('morphs innerHTML as content properly when argument is empty array', function()
    {
        let initial = make("<div>Foo</div>");
        Idiomorph.morph(initial, [], {morphStyle:'innerHTML'});
        initial.outerHTML.should.equal("<div></div>");
    });

    it('ignores active element when ignoreActive set to true', function()
    {
        let initialSource = "<div><div id='d1'>Foo</div><input id='i1'></div>";
        getWorkArea().innerHTML = initialSource;
        let i1 = document.getElementById('i1');
        i1.focus();
        let d1 = document.getElementById('d1');
        i1.value = "asdf";
        let finalSource = "<div><div id='d1'>Bar</div><input id='i1'></div>";
        Idiomorph.morph(getWorkArea(), finalSource, {morphStyle:'innerHTML', ignoreActive:true});
        d1.innerText.should.equal("Bar")
        i1.value.should.equal("asdf")
    });

    it('can morph a body tag properly', function()
    {
        let initial = parseHTML("<body>Foo</body>");
        let finalSrc = '<body foo="bar">Foo</body>';
        let final = parseHTML(finalSrc);
        Idiomorph.morph(initial.body, final.body);
        initial.body.outerHTML.should.equal(finalSrc);

    });

    it('can morph a full document properly', function()
    {
        let initial = parseHTML("<html><body>Foo</body></html>");
        let finalSrc = '<html foo="bar"><head></head><body foo="bar">Foo</body></html>';
        Idiomorph.morph(initial, finalSrc);
        initial.documentElement.outerHTML.should.equal(finalSrc);
    });

    it('ignores active input value when ignoreActiveValue is true', function()
    {
        let parent = make("<div><input value='foo'></div>");
        document.body.append(parent);

        let initial = parent.querySelector("input");

        // morph
        let finalSrc = '<input value="bar">';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        initial.outerHTML.should.equal('<input value="bar">');

        initial.focus();

        document.activeElement.should.equal(initial);

        let finalSrc2 = '<input class="foo" value="doh">';
        Idiomorph.morph(initial, finalSrc2, {morphStyle:'outerHTML', ignoreActiveValue: true});
        initial.value.should.equal('bar');
        initial.classList.value.should.equal('foo');

        document.body.removeChild(parent);
    });

    it('does not ignore body when ignoreActiveValue is true and no element has focus', function()
    {
        let parent = make("<div><input value='foo'></div>");
        document.body.append(parent);

        let initial = parent.querySelector("input");

        // morph
        let finalSrc = '<input value="bar">';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        initial.outerHTML.should.equal('<input value="bar">');

        document.activeElement.should.equal(initial);

        let finalSrc2 = '<input class="foo" value="doh">';
        Idiomorph.morph(initial, finalSrc2, {morphStyle:'outerHTML', ignoreActiveValue: true});
        initial.value.should.equal('doh');
        initial.classList.value.should.equal('foo');

        document.body.removeChild(parent);
    });

    it('can ignore attributes w/ the beforeAttributeUpdated callback', function()
    {
        let parent = make("<div><input value='foo'></div>");
        document.body.append(parent);

        let initial = parent.querySelector("input");

        // morph
        let finalSrc = '<input value="bar">';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        initial.outerHTML.should.equal('<input value="bar">');

        let finalSrc2 = '<input class="foo" value="doh">';
        Idiomorph.morph(initial, finalSrc2, {morphStyle:'outerHTML', callbacks : {
            beforeAttributeUpdated: function(attr){
                if (attr === 'value') {
                    return false;
                }
            }
        }});
        initial.value.should.equal('bar');
        initial.classList.value.should.equal('foo');

        document.body.removeChild(parent);
    });

    it('can ignore attributes w/ the beforeAttributeUpdated callback 2', function()
    {
        let parent = make("<div><input value='foo'></div>");
        document.body.append(parent);

        let initial = parent.querySelector("input");

        // morph
        let finalSrc = '<input value="bar">';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        initial.outerHTML.should.equal('<input value="bar">');

        let finalSrc2 = '<input class="foo" value="doh">';
        Idiomorph.morph(initial, finalSrc2, {morphStyle:'outerHTML', callbacks : {
            beforeAttributeUpdated: function(attr){
                if (attr === 'class') {
                    return false;
                }
            }
        }});
        initial.value.should.equal('doh');
        initial.classList.value.should.equal('');

        document.body.removeChild(parent);
    });

    it('ignores active textarea value when ignoreActiveValue is true', function()
    {
        let parent = make("<div><textarea>foo</textarea></div>");
        document.body.append(parent);
        let initial = parent.querySelector("textarea");

        let finalSrc = '<textarea>bar</textarea>';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== '<input value="bar">') {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal('<textarea>bar</textarea>');

        initial.focus();

        document.activeElement.should.equal(initial);

        let finalSrc2 = '<textarea class="foo">doh</textarea>';
        Idiomorph.morph(initial, finalSrc2, {morphStyle:'outerHTML', ignoreActiveValue: true});
        initial.outerHTML.should.equal('<textarea class="foo">bar</textarea>');

        document.body.removeChild(parent);
    });

    it('can morph input checked properly, remove checked', function()
    {
        let parent = make('<div><input type="checkbox" checked></div>');
        document.body.append(parent);
        let initial = parent.querySelector("input");

        let finalSrc = '<input type="checkbox">';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== '<input type="checkbox">') {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal('<input type="checkbox">');
        initial.checked.should.equal(false);
        document.body.removeChild(parent);
    });

    it('can morph input checked properly, add checked', function()
    {
        let parent = make('<div><input type="checkbox"></div>');
        document.body.append(parent);
        let initial = parent.querySelector("input");

        let finalSrc = '<input type="checkbox" checked>';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== '<input type="checkbox" checked="">') {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal('<input type="checkbox" checked="">');
        initial.checked.should.equal(true);
        document.body.removeChild(parent);
    });

    it('can morph input checked properly, set checked property to true', function()
    {
        let parent = make('<div><input type="checkbox" checked></div>');
        document.body.append(parent);
        let initial = parent.querySelector("input");
        initial.checked = false;

        let finalSrc = '<input type="checkbox" checked>';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== '<input type="checkbox" checked="true">') {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal('<input type="checkbox" checked="true">');
        initial.checked.should.equal(true);
        document.body.removeChild(parent);
    });

    it('can morph input checked properly, set checked property to false', function()
    {
        let parent = make('<div><input type="checkbox"></div>');
        document.body.append(parent);
        let initial = parent.querySelector("input");
        initial.checked = true;

        let finalSrc = '<input type="checkbox">';
        Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});
        if (initial.outerHTML !== '<input type="checkbox">') {
            console.log("HTML after morph: " + initial.outerHTML);
            console.log("Expected:         " + finalSrc);
        }
        initial.outerHTML.should.equal('<input type="checkbox">');
        initial.checked.should.equal(false);
        document.body.removeChild(parent);
    });

    it('can override defaults w/ global set', function()
    {
        try {
            // set default to inner HTML
            Idiomorph.defaults.morphStyle = 'innerHTML';
            let initial = make("<button>Foo</button>");
            let finalSrc = "<button>Bar</button>";

            // should more inner HTML despite no config
            Idiomorph.morph(initial, finalSrc);

            if (initial.outerHTML !== "<button>Bar</button>") {
                console.log("HTML after morph: " + initial.outerHTML);
                console.log("Expected:         " + finalSrc);
            }
            initial.outerHTML.should.equal("<button><button>Bar</button></button>");
        } finally {
            Idiomorph.defaults.morphStyle = 'outerHTML';
        }
    });

    it('can override globally set default w/ local value', function()
    {
        try {
            // set default to inner HTML
            Idiomorph.defaults.morphStyle = 'innerHTML';
            let initial = make("<button>Foo</button>");
            let finalSrc = "<button>Bar</button>";

            // should morph outer HTML despite default setting
            Idiomorph.morph(initial, finalSrc, {morphStyle:'outerHTML'});

            if (initial.outerHTML !== "<button>Bar</button>") {
                console.log("HTML after morph: " + initial.outerHTML);
                console.log("Expected:         " + finalSrc);
            }
            initial.outerHTML.should.equal("<button>Bar</button>");
        } finally {
            Idiomorph.defaults.morphStyle = 'outerHTML';
        }
    });


})
