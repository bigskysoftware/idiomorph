describe("Bootstrap test", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    // bootstrap test
    it('can morph content to content', function()
    {
        let btn1 = make('<button>Foo</button>')
        let btn2 = make('<button>Bar</button>')

        Idiomorph.morph(btn1, btn2);

        btn1.innerHTML.should.equal(btn2.innerHTML);
    });

    it('can morph attributes', function()
    {
        let btn1 = make('<button class="foo" disabled>Foo</button>')
        let btn2 = make('<button class="bar">Bar</button>')

        Idiomorph.morph(btn1, btn2);

        btn1.getAttribute("class").should.equal("bar");
        should.equal(null, btn1.getAttribute("disabled"));
    });

    it('can morph children', function()
    {
        let div1 = make('<div><button class="foo" disabled>Foo</button></div>')
        let btn1 = div1.querySelector('button');
        let div2 = make('<div><button class="bar">Bar</button></div>')
        let btn2 = div2.querySelector('button');

        Idiomorph.morph(div1, div2);

        btn1.getAttribute("class").should.equal("bar");
        should.equal(null, btn1.getAttribute("disabled"));
        btn1.innerHTML.should.equal(btn2.innerHTML);
    });

    it('basic deep morph works', function(done)
    {
        let div1 = make('<div id="root1"><div><div id="d1">A</div></div><div><div id="d2">B</div></div><div><div id="d3">C</div></div></div>')

        let d1 = div1.querySelector("#d1")
        let d2 = div1.querySelector("#d2")
        let d3 = div1.querySelector("#d3")

        let morphTo = '<div id="root2"><div><div id="d2">E</div></div><div><div id="d3">F</div></div><div><div id="d1">D</div></div></div>';
        let div2 = make(morphTo)

        print(div1);
        Idiomorph.morph(div1, div2);
        print(div1);

        // first paragraph should have been discarded in favor of later matches
        d1.innerHTML.should.equal("A");

        // second and third paragraph should have morphed
        d2.innerHTML.should.equal("E");
        d3.innerHTML.should.equal("F");

        console.log(morphTo);
        console.log(div1.outerHTML);
        div1.outerHTML.should.equal(morphTo)

        setTimeout(()=> {
            console.log("idiomorph mutations : ", div1.mutations);
            done();
        }, 0)
    });

    it('deep morphdom does not work ideally', function(done)
    {
        let div1 = make('<div id="root"><div><div id="d1">A</div></div><div><div id="d2">B</div></div><div><div id="d3">C</div></div></div>')

        let d1 = div1.querySelector("#d1")
        let d2 = div1.querySelector("#d2")
        let d3 = div1.querySelector("#d3")

        morphdom(div1, '<div id="root2"><div><div id="d2">E</div></div><div><div id="d3">F</div></div><div><div id="d1">D</div></div></div>', {});

        setTimeout(()=> {
            console.log("morphdom mutations : ", div1.mutations);
            done();
        }, 0)
        print(div1);
    });

})
