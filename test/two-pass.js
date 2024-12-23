describe("Two-pass option for retaining more state", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    it('fails to preserve all non-attribute element state with single-pass option', function()
    {
        getWorkArea().append(make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `));
        document.getElementById("first").indeterminate = true
        document.getElementById("second").indeterminate = true

        let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML', twoPass:false});

        getWorkArea().innerHTML.should.equal(finalSrc);
        const states = Array.from(getWorkArea().querySelectorAll("input")).map(e => e.indeterminate);
        states.should.eql([true, false]);
    });

    it('preserves all non-attribute element state with two-pass option', function()
    {
        getWorkArea().append(make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `));
        document.getElementById("first").indeterminate = true
        document.getElementById("second").indeterminate = true

        let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        const states = Array.from(getWorkArea().querySelectorAll("input")).map(e => e.indeterminate);
        states.should.eql([true, true]);
    });

    it('preserves all non-attribute element state with two-pass option and outerHTML morphStyle', function()
    {
        const div = make(`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `);
        getWorkArea().append(div);
        document.getElementById("first").indeterminate = true
        document.getElementById("second").indeterminate = true

        let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `;
        Idiomorph.morph(div, finalSrc, {morphStyle:'outerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        const states = Array.from(getWorkArea().querySelectorAll("input")).map(e => e.indeterminate);
        states.should.eql([true, true]);
    });

    it('preserves non-attribute state when elements are moved to different levels of the DOM', function()
    {
        getWorkArea().append(make(`
            <div>
              <input type="checkbox" id="first">
              <div>
                <input type="checkbox" id="second">
              </div>
            </div>
        `));
        document.getElementById("first").indeterminate = true
        document.getElementById("second").indeterminate = true

        let finalSrc = `
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        const states = Array.from(getWorkArea().querySelectorAll("input")).map(e => e.indeterminate);
        states.should.eql([true, true]);
    });

    it('preserves non-attribute state when elements are moved between different containers', function()
    {
        getWorkArea().append(make(`
            <div>
              <div id="left">
                <input type="checkbox" id="first">
              </div>
              <div id="right">
                <input type="checkbox" id="second">
              </div>
            </div>
        `));
        document.getElementById("first").indeterminate = true
        document.getElementById("second").indeterminate = true

        let finalSrc = `
            <div>
              <div id="left">
                <input type="checkbox" id="second">
              </div>
              <div id="right">
                <input type="checkbox" id="first">
              </div>
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        const states = Array.from(getWorkArea().querySelectorAll("input")).map(e => e.indeterminate);
        states.should.eql([true, true]);
    });

    it('preserves non-attribute state when parents are reorderd', function()
    {
        getWorkArea().append(make(`
            <div>
              <div id="left">
                <input type="checkbox" id="first">
              </div>
              <div id="right">
                <input type="checkbox" id="second">
              </div>
            </div>
        `));
        document.getElementById("first").indeterminate = true
        document.getElementById("second").indeterminate = true

        let finalSrc = `
            <div>
              <div id="right">
                <input type="checkbox" id="second">
              </div>
              <div id="left">
                <input type="checkbox" id="first">
              </div>
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        const states = Array.from(getWorkArea().querySelectorAll("input")).map(e => e.indeterminate);
        states.should.eql([true, true]);
    });

    it('preserves focus state with two-pass option and outerHTML morphStyle', function()
    {
        const div = make(`
            <div>
              <input type="text" id="first">
              <input type="text" id="second">
            </div>
        `);
        getWorkArea().append(div);
        document.getElementById("first").focus()

        let finalSrc = `
            <div>
              <input type="text" id="second">
              <input type="text" id="first">
            </div>
        `;
        Idiomorph.morph(div, finalSrc, {morphStyle:'outerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        if(document.body.moveBefore) {
          document.activeElement.outerHTML.should.equal(document.getElementById("first").outerHTML);
        } else {
          document.activeElement.outerHTML.should.equal(document.body.outerHTML);
          console.log('preserves focus state with two-pass option and outerHTML morphStyle test needs moveBefore enabled to work properly')
        }
    });

    it('preserves focus state when elements are moved to different levels of the DOM', function()
    {
        getWorkArea().append(make(`
            <div>
              <input type="text" id="first">
              <div>
                <input type="text" id="second">
              </div>
            </div>
        `));
        document.getElementById("second").focus()

        let finalSrc = `
            <div>
              <input type="text" id="first">
              <input type="text" id="second">
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        if(document.body.moveBefore) {
          document.activeElement.outerHTML.should.equal(document.getElementById("second").outerHTML);
        } else {
          document.activeElement.outerHTML.should.equal(document.body.outerHTML);
          console.log('preserves focus state when elements are moved to different levels of the DOM test needs moveBefore enabled to work properly')
        }
    });

    it('preserves focus state when elements are moved between different containers', function()
    {
        getWorkArea().append(make(`
            <div>
              <div id="left">
                <input type="text" id="first">
              </div>
              <div id="right">
                <input type="text" id="second">
              </div>
            </div>
        `));
        document.getElementById("first").focus()

        let finalSrc = `
            <div>
              <div id="left">
                <input type="text" id="second">
              </div>
              <div id="right">
                <input type="text" id="first">
              </div>
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        if(document.body.moveBefore) {
          document.activeElement.outerHTML.should.equal(document.getElementById("first").outerHTML);
        } else {
          document.activeElement.outerHTML.should.equal(document.body.outerHTML);
          console.log('preserves focus state when elements are moved between different containers test needs moveBefore enabled to work properly')
        }
    });

    it('preserves focus state when parents are reorderd', function()
    {
        getWorkArea().append(make(`
            <div>
              <div id="left">
                <input type="text" id="first">
              </div>
              <div id="right">
                <input type="text" id="second">
              </div>
            </div>
        `));
        document.getElementById("first").focus()

        let finalSrc = `
            <div>
              <div id="right">
                <input type="text" id="second">
              </div>
              <div id="left">
                <input type="text" id="first">
              </div>
            </div>
        `;
        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true});

        getWorkArea().innerHTML.should.equal(finalSrc);
        if(document.body.moveBefore) {
          document.activeElement.outerHTML.should.equal(document.getElementById("first").outerHTML);
        } else {
          document.activeElement.outerHTML.should.equal(document.body.outerHTML);
          console.log('preserves focus state when parents are reorderd test needs moveBefore enabled to work properly')
        }
    });

    it('hooks work as expected', function()
    {
        let beginSrc =`
            <div>
              <input type="checkbox" id="first">
              <input type="checkbox" id="second">
            </div>
        `.trim();
        getWorkArea().append(make(beginSrc));

        let finalSrc = `
            <div>
              <input type="checkbox" id="second">
              <input type="checkbox" id="first">
            </div>
        `.trim();

        let wrongHookCalls = [];
        let wrongHookHandler = name => {
            return node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                wrongHookCalls.push([name, node.outerHTML]);
            }
        }

        let calls = [];

        Idiomorph.morph(getWorkArea(), finalSrc, {morphStyle:'innerHTML',twoPass:true,callbacks:{
            beforeNodeAdded: wrongHookHandler("beforeNodeAdded"),
            afterNodeAdded: wrongHookHandler("afterNodeAdded"),
            beforeNodeRemoved: wrongHookHandler("beforeNodeRemoved"),
            afterNodeRemoved: wrongHookHandler("afterNodeRemoved"),
            beforeNodeMorphed: (oldNode, newNode) => {
                if (oldNode.nodeType !== Node.ELEMENT_NODE) return;
                calls.push(["before", oldNode.outerHTML, newNode.outerHTML]);
            },
            afterNodeMorphed: (oldNode, newNode) => {
                if (oldNode.nodeType !== Node.ELEMENT_NODE) return;
                calls.push(["after", oldNode.outerHTML, newNode.outerHTML]);
            },
        }});

        getWorkArea().innerHTML.should.equal(finalSrc);

        wrongHookCalls.should.eql([]);
        calls.should.eql([
            ["before", beginSrc, finalSrc],
            ["before", `<input type="checkbox" id="second">`, `<input type="checkbox" id="second">`],
            ["after", `<input type="checkbox" id="second">`, `<input type="checkbox" id="second">`],
            ["after",
              finalSrc,
              "<div>\n              <input type=\"checkbox\" id=\"second\">\n              </div>",
            ],
            ["before", `<input type="checkbox" id="first">`, `<input type="checkbox" id="first">`],
            ["after", `<input type="checkbox" id="first">`, `<input type="checkbox" id="first">`],
        ]);

    });
});
