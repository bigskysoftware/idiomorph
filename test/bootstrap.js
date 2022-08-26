describe("Bootstrap test", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    afterEach(function()  {
        clearWorkArea();
    });

    // bootstrap test
    it('can morph content to content', function()
    {
        var btn1 = make('<button>Foo</button>')
        var btn2 = make('<button>Bar</button>')
        Idiomorph.morph(btn1, btn2);
        btn1.innerHTML.should.equal(btn2.innerHTML);
    });

    it('can morph attributes', function()
    {
        var btn1 = make('<button class="foo" disabled>Foo</button>')
        var btn2 = make('<button class="bar">Bar</button>')
        Idiomorph.morph(btn1, btn2);
        btn1.getAttribute("class").should.equal("bar");
        should.equal(null, btn1.getAttribute("disabled"));
    });


})
