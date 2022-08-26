describe("Bootstrap test", function(){

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


})
