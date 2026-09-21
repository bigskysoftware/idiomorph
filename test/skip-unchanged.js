describe("skipUnchanged option", function () {
  setup();

  // Records every beforeNodeMorphed/afterNodeMorphed call as [hook, oldNode.outerHTML|textContent]
  function recordingCallbacks(calls) {
    const label = (node) => node.outerHTML || node.textContent;
    return {
      beforeNodeMorphed: (oldNode) => {
        calls.push(["before", label(oldNode)]);
      },
      afterNodeMorphed: (oldNode) => {
        calls.push(["after", label(oldNode)]);
      },
    };
  }

  describe("differential form-state regressions", function () {
    // Keep these enabled while the implementation is parked: equal markup is
    // not enough to prove that skipping preserves the normal morph's behavior.
    function morphAndSnapshot(oldHTML, newHTML, skipUnchanged, prepare) {
      const workArea = getWorkArea();
      // Radio coupling requires a connected tree. Run fixtures sequentially so
      // same-name radios from the baseline cannot affect the candidate run.
      workArea.innerHTML = oldHTML;
      const root = workArea.firstElementChild;
      try {
        if (prepare) prepare(root);
        Idiomorph.morph(root, newHTML, { skipUnchanged });
        return {
          html: root.outerHTML,
          inputs: Array.from(root.querySelectorAll("input"), (input) => ({
            value: input.value,
            checked: input.checked,
          })),
          selects: Array.from(root.querySelectorAll("select"), (select) => ({
            value: select.value,
            selectedIndex: select.selectedIndex,
          })),
          options: Array.from(root.querySelectorAll("option"), (option) => ({
            value: option.value,
            selected: option.selected,
            defaultSelected: option.defaultSelected,
          })),
        };
      } finally {
        clearWorkArea();
      }
    }

    function assertSameMorph(oldHTML, newHTML, prepare) {
      const baseline = morphAndSnapshot(oldHTML, newHTML, false, prepare);
      const skipped = morphAndSnapshot(oldHTML, newHTML, true, prepare);
      skipped.should.eql(baseline);
    }

    it("matches normal morphing when a radio changes a later subtree's checked state", function () {
      assertSameMorph(
        `<div><section><input type="radio" name="group" value="a"></section><section><input type="radio" name="group" value="b" checked></section></div>`,
        `<div><section><input type="radio" name="group" value="a" checked></section><section><input type="radio" name="group" value="b" checked></section></div>`,
      );
    });

    it("matches normal morphing when implicit selection crosses an unchanged optgroup", function () {
      assertSameMorph(
        `<div><select><optgroup><option>A</option></optgroup><option selected>B</option></select></div>`,
        `<div><select><optgroup><option>A</option></optgroup><option>B</option></select></div>`,
      );
    });

    it("matches normal morphing of a dirty all-disabled select", function () {
      const html = `<div><select><option disabled>A</option><option disabled>B</option></select></div>`;
      assertSameMorph(html, html, (root) => {
        root.querySelector("select").selectedIndex = 0;
      });
    });
  });

  describe("off by default", function () {
    it("still visits every node of an identical subtree", function () {
      const calls = [];
      const initial = make(`<div><p><b>x</b></p></div>`);
      Idiomorph.morph(initial, `<div><p><b>x</b></p></div>`, {
        callbacks: recordingCallbacks(calls),
      });
      calls.should.eql([
        ["before", "<div><p><b>x</b></p></div>"],
        ["before", "<p><b>x</b></p>"],
        ["before", "<b>x</b>"],
        ["before", "x"],
        ["after", "x"],
        ["after", "<b>x</b>"],
        ["after", "<p><b>x</b></p>"],
        ["after", "<div><p><b>x</b></p></div>"],
      ]);
    });

    it("still clears a typed input value as before", function () {
      const initial = make(`<div><input></div>`);
      initial.querySelector("input").value = "typed";
      Idiomorph.morph(initial, `<div><input></div>`);
      initial.querySelector("input").value.should.equal("");
    });
  });

  describe("on", function () {
    it("skips the descendants of an equal subtree but still calls both hooks on its root", function () {
      const calls = [];
      const initial = make(`<div><p><b>x</b></p></div>`);
      Idiomorph.morph(initial, `<div><p><b>x</b></p></div>`, {
        skipUnchanged: true,
        callbacks: recordingCallbacks(calls),
      });
      initial.outerHTML.should.equal(`<div><p><b>x</b></p></div>`);
      calls.should.eql([
        ["before", "<div><p><b>x</b></p></div>"],
        ["after", "<div><p><b>x</b></p></div>"],
      ]);
    });

    it("does not call beforeAttributeUpdated inside a skipped subtree", function () {
      let attributeCalls = 0;
      const initial = make(`<div><p class="a"><b id="b">x</b></p></div>`);
      Idiomorph.morph(initial, `<div><p class="a"><b id="b">x</b></p></div>`, {
        skipUnchanged: true,
        callbacks: {
          beforeAttributeUpdated: () => {
            attributeCalls++;
          },
        },
      });
      attributeCalls.should.equal(0);
    });

    it("still morphs a subtree whose deepest leaf changed", function () {
      const calls = [];
      const initial = make(`<div><p><b>x</b></p><p><b>same</b></p></div>`);
      Idiomorph.morph(initial, `<div><p><b>y</b></p><p><b>same</b></p></div>`, {
        skipUnchanged: true,
        callbacks: recordingCallbacks(calls),
      });
      initial.outerHTML.should.equal(
        `<div><p><b>y</b></p><p><b>same</b></p></div>`,
      );
      calls.should.eql([
        ["before", "<div><p><b>x</b></p><p><b>same</b></p></div>"],
        ["before", "<p><b>x</b></p>"],
        ["before", "<b>x</b>"],
        ["before", "x"],
        ["after", "y"],
        ["after", "<b>y</b>"],
        ["after", "<p><b>y</b></p>"],
        ["before", "<p><b>same</b></p>"],
        ["after", "<p><b>same</b></p>"],
        ["after", "<div><p><b>y</b></p><p><b>same</b></p></div>"],
      ]);
    });

    it("still honours beforeNodeMorphed returning false on an equal root", function () {
      const calls = [];
      const initial = make(`<div><p>x</p></div>`);
      Idiomorph.morph(initial, `<div><p>x</p></div>`, {
        skipUnchanged: true,
        callbacks: {
          beforeNodeMorphed: (oldNode) => {
            calls.push(oldNode.outerHTML || oldNode.textContent);
            return false;
          },
          afterNodeMorphed: () => {
            calls.push("after");
          },
        },
      });
      calls.should.eql(["<div><p>x</p></div>"]);
    });

    describe("dirty form controls are never skipped", function () {
      // Each case morphs the control as an outerHTML root, so the pair given to
      // morphNode is the control itself and the skip-time re-check decides.

      it("text input with a typed value is reset as before", function () {
        const input = make(`<input>`);
        input.value = "typed";
        Idiomorph.morph(input, `<input>`, { skipUnchanged: true });
        input.value.should.equal("");
      });

      it("checkbox with toggled checked is reset as before", function () {
        const input = make(`<input type="checkbox">`);
        input.checked = true;
        Idiomorph.morph(input, `<input type="checkbox">`, {
          skipUnchanged: true,
        });
        input.checked.should.equal(false);
      });

      it("checkbox with a programmatic value and untouched checked is synced as before", function () {
        // setting .value on a checkbox reflects to the value attribute, so this is caught by
        // isEqualNode rather than the predicate; kept as a regression guard for the "on" default rule
        const input = make(`<input type="checkbox" value="a">`);
        input.value = "b";
        Idiomorph.morph(input, `<input type="checkbox" value="a">`, {
          skipUnchanged: true,
        });
        input.value.should.equal("a");
      });

      it("radio with toggled checked is reset as before", function () {
        const input = make(`<input type="radio">`);
        input.checked = true;
        Idiomorph.morph(input, `<input type="radio">`, { skipUnchanged: true });
        input.checked.should.equal(false);
      });

      it("text input with programmatic checked is synced as before", function () {
        const input = make(`<input>`);
        input.checked = true;
        Idiomorph.morph(input, `<input>`, { skipUnchanged: true });
        input.checked.should.equal(false);
      });

      it("textarea with a typed value is reset as before", function () {
        const textarea = make(`<textarea>foo</textarea>`);
        textarea.value = "typed";
        Idiomorph.morph(textarea, `<textarea>foo</textarea>`, {
          skipUnchanged: true,
        });
        textarea.value.should.equal("foo");
      });

      // The following five cases morph a <select>/<datalist> whose own markup is
      // byte-for-byte unchanged, with the dirty state living on a child <option>.
      // isEqualNode already reports the select/datalist pair as equal, so the
      // ancestor is skipped before the option is ever visited by morphNode's
      // skip-time re-check. Making these pass requires Task 3's pre-scan to mark
      // the ancestor unskippable; un-skip them there.

      it("single select with a changed option is reset as before", function () {
        const select = make(
          `<select><option value="a">A</option><option value="b">B</option></select>`,
        );
        select.value = "b";
        Idiomorph.morph(
          select,
          `<select><option value="a">A</option><option value="b">B</option></select>`,
          { skipUnchanged: true },
        );
        select.value.should.equal("a");
      });

      it("single select whose selected attribute is on a later option is reset as before", function () {
        const select = make(
          `<select><option value="a">A</option><option value="b" selected>B</option></select>`,
        );
        select.value = "a";
        Idiomorph.morph(
          select,
          `<select><option value="a">A</option><option value="b" selected>B</option></select>`,
          { skipUnchanged: true },
        );
        select.value.should.equal("b");
      });

      it("multiple select with a changed option is reset as before", function () {
        const select = make(
          `<select multiple><option value="a" selected>A</option><option value="b">B</option></select>`,
        );
        // WebKit leaves select.options empty for a detached-fragment select,
        // so address the option through the DOM instead.
        const options = select.querySelectorAll("option");
        options[1].selected = true;
        Idiomorph.morph(
          select,
          `<select multiple><option value="a" selected>A</option><option value="b">B</option></select>`,
          { skipUnchanged: true },
        );
        options[1].selected.should.equal(false);
      });

      it("listbox (size > 1) select with a changed option is reset as before", function () {
        const select = make(
          `<select size="2"><option value="a">A</option><option value="b">B</option></select>`,
        );
        select.value = "b";
        Idiomorph.morph(
          select,
          `<select size="2"><option value="a">A</option><option value="b">B</option></select>`,
          { skipUnchanged: true },
        );
        select.selectedIndex.should.equal(-1);
      });

      it("option outside a select uses defaultSelected", function () {
        const datalist = make(
          `<datalist><option value="a"></option></datalist>`,
        );
        datalist.firstChild.selected = true;
        Idiomorph.morph(
          datalist,
          `<datalist><option value="a"></option></datalist>`,
          {
            skipUnchanged: true,
          },
        );
        datalist.firstChild.selected.should.equal(false);
      });

      // The cases above morph a container whose own markup never changes, so
      // isUnskippable is only ever asked about the container (never the option)
      // until Task 3's pre-scan exists. Morphing the option itself as the root
      // exercises defaultSelectedOf's branches directly today.

      it("standalone option (outside any select) is reset via defaultSelected", function () {
        const option = make(`<option value="a"></option>`);
        option.selected = true;
        Idiomorph.morph(option, `<option value="a"></option>`, {
          skipUnchanged: true,
        });
        option.selected.should.equal(false);
      });

      it("option inside a multiple select is reset via defaultSelected", function () {
        const select = make(
          `<select multiple><option value="a">A</option><option value="b">B</option></select>`,
        );
        const option = select.querySelectorAll("option")[1];
        option.selected = true;
        Idiomorph.morph(option, `<option value="b">B</option>`, {
          skipUnchanged: true,
        });
        option.selected.should.equal(false);
      });

      it("option inside a listbox (size > 1) select is reset via defaultSelected", function () {
        const select = make(
          `<select size="2"><option value="a">A</option><option value="b">B</option></select>`,
        );
        const option = select.querySelectorAll("option")[1];
        option.selected = true;
        Idiomorph.morph(option, `<option value="b">B</option>`, {
          skipUnchanged: true,
        });
        option.selected.should.equal(false);
      });

      it("file input is never considered dirty", function () {
        const calls = [];
        const input = make(`<input type="file">`);
        Idiomorph.morph(input, `<input type="file">`, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", `<input type="file">`],
          ["after", `<input type="file">`],
        ]);
      });
    });

    describe("clean form controls are skipped", function () {
      it("skips an attribute-less checkbox (value defaults to 'on')", function () {
        const calls = [];
        const initial = make(`<div><input type="checkbox"></div>`);
        Idiomorph.morph(initial, `<div><input type="checkbox"></div>`, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", `<div><input type="checkbox"></div>`],
          ["after", `<div><input type="checkbox"></div>`],
        ]);
      });

      it("skips a single select whose selected attribute is on a later option", function () {
        const calls = [];
        const html = `<div><select><option>a</option><option selected="">b</option></select></div>`;
        const initial = make(html);
        Idiomorph.morph(initial, html, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", html],
          ["after", html],
        ]);
      });

      it("skips a single select whose first option is disabled", function () {
        const calls = [];
        const html = `<div><select><option disabled="">a</option><option>b</option></select></div>`;
        const initial = make(html);
        Idiomorph.morph(initial, html, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", html],
          ["after", html],
        ]);
      });

      it("skips a single select whose options are all disabled", function () {
        const calls = [];
        const html = `<div><select><option disabled="">a</option></select></div>`;
        const initial = make(html);
        Idiomorph.morph(initial, html, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", html],
          ["after", html],
        ]);
      });

      it("skips a checkbox with a value attribute", function () {
        const calls = [];
        const initial = make(`<div><input type="checkbox" value="x"></div>`);
        Idiomorph.morph(
          initial,
          `<div><input type="checkbox" value="x"></div>`,
          {
            skipUnchanged: true,
            callbacks: recordingCallbacks(calls),
          },
        );
        calls.should.eql([
          ["before", `<div><input type="checkbox" value="x"></div>`],
          ["after", `<div><input type="checkbox" value="x"></div>`],
        ]);
      });

      it("skips a clean text input, textarea and select", function () {
        // the first option of an untouched single-select reports selected=true but
        // defaultSelected=false; the effective-default rule must still treat it as clean
        const calls = [];
        const html = `<div><input value="a"><textarea>b</textarea><select><option>c</option><option>d</option></select></div>`;
        const initial = make(html);
        Idiomorph.morph(initial, html, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", html],
          ["after", html],
        ]);
      });

      // Same reasoning as the "option inside a ... select is reset" tests above:
      // morphing the option itself as the root exercises defaultSelectedOf's
      // single-select branches (explicit `selected`, implicit first option,
      // disabled options) directly today.

      it("skips a clean option that is explicitly selected", function () {
        const calls = [];
        const select = make(
          `<select><option value="a">A</option><option value="b" selected="">B</option></select>`,
        );
        const option = select.querySelectorAll("option")[1];
        Idiomorph.morph(option, `<option value="b" selected="">B</option>`, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", `<option value="b" selected="">B</option>`],
          ["after", `<option value="b" selected="">B</option>`],
        ]);
      });

      it("skips a clean, implicitly-selected first option", function () {
        const calls = [];
        const select = make(
          `<select><option value="a">A</option><option value="b">B</option></select>`,
        );
        const option = select.querySelectorAll("option")[0];
        Idiomorph.morph(option, `<option value="a">A</option>`, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", `<option value="a">A</option>`],
          ["after", `<option value="a">A</option>`],
        ]);
      });

      it("skips a clean option following a disabled option", function () {
        const calls = [];
        const select = make(
          `<select><option value="a" disabled="">A</option><option value="b">B</option></select>`,
        );
        const option = select.querySelectorAll("option")[1];
        Idiomorph.morph(option, `<option value="b">B</option>`, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", `<option value="b">B</option>`],
          ["after", `<option value="b">B</option>`],
        ]);
      });

      it("skips a clean option when every option in the select is disabled", function () {
        const calls = [];
        const select = make(
          `<select><option value="a" disabled="">A</option></select>`,
        );
        const option = select.querySelectorAll("option")[0];
        Idiomorph.morph(option, `<option value="a" disabled="">A</option>`, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", `<option value="a" disabled="">A</option>`],
          ["after", `<option value="a" disabled="">A</option>`],
        ]);
      });
    });

    describe("templates and the head are never skipped", function () {
      it("re-morphs template content even though the template's outerHTML looks unchanged", function () {
        // isEqualNode does not look inside .content, so without the special case
        // this mutation would be missed and the skip would leave "changed" in place
        const template = make(`<template><p>x</p></template>`);
        template.content.querySelector("p").textContent = "changed";
        Idiomorph.morph(template, `<template><p>x</p></template>`, {
          skipUnchanged: true,
        });
        template.content.querySelector("p").textContent.should.equal("x");
      });

      it("still applies head re-append side effects when the head looks unchanged", function () {
        // im-re-append removes and re-adds a matching head element even when it's
        // otherwise identical; isEqualNode can't see that, so without the special
        // case the head would be skipped and the re-append would never happen
        const parser = new DOMParser();
        const doc = parser.parseFromString(
          `<html><head><meta im-re-append="true"></head></html>`,
          "text/html",
        );
        const originalMeta = doc.head.firstChild;
        Idiomorph.morph(doc.head, `<head><meta im-re-append="true"></head>`, {
          skipUnchanged: true,
        });
        doc.head.firstChild.should.not.equal(originalMeta);
      });
    });

    describe("dirty state on the new side", function () {
      // The dirty input inside `final` is a descendant of the pair root `<div>`,
      // not the pair itself; this only passes once Task 3 adds the pre-scan.
      it("morphs when the new input carries a programmatic value", function () {
        const initial = make(`<div><input value="a"></div>`);
        const final = make(`<div><input value="a"></div>`);
        final.querySelector("input").value = "b";
        Idiomorph.morph(initial, final, { skipUnchanged: true });
        initial.querySelector("input").value.should.equal("b");
      });
    });

    describe("hidden state mutated by beforeNodeMorphed", function () {
      it("honours a callback that sets the new node's value", function () {
        const initial = make(`<input value="a">`);
        Idiomorph.morph(initial, `<input value="a">`, {
          skipUnchanged: true,
          callbacks: {
            beforeNodeMorphed: (oldNode, newNode) => {
              newNode.value = "x";
            },
          },
        });
        initial.value.should.equal("x");
      });

      it("keeps working for the #132 two-way-binding pattern (copy the typed value onto the new node)", function () {
        // https://github.com/bigskysoftware/idiomorph/issues/132 — incoming markup has no
        // value attribute; the app preserves user input from beforeNodeMorphed by setting
        // the *attribute* on newNode (syncInputValue only ever consults newNode's
        // "value" attribute, never a bare .value property assignment)
        const initial = make(`<div><input></div>`);
        initial.querySelector("input").value = "typed";
        Idiomorph.morph(initial, `<div><input></div>`, {
          skipUnchanged: true,
          callbacks: {
            beforeNodeMorphed: (oldNode, newNode) => {
              if (oldNode instanceof HTMLInputElement)
                newNode.setAttribute("value", oldNode.value);
            },
          },
        });
        initial.querySelector("input").value.should.equal("typed");
      });

      it("honours a callback that sets the old node's value (reset to the new value, as today)", function () {
        const initial = make(`<input value="a">`);
        Idiomorph.morph(initial, `<input value="a">`, {
          skipUnchanged: true,
          callbacks: {
            beforeNodeMorphed: (oldNode) => {
              oldNode.value = "client";
            },
          },
        });
        initial.value.should.equal("a");
      });

      it("does not honour a callback that mutates a descendant of an equal root (documented limitation)", function () {
        const initial = make(`<div><input value="a"></div>`);
        Idiomorph.morph(initial, `<div><input value="a"></div>`, {
          skipUnchanged: true,
          callbacks: {
            beforeNodeMorphed: (oldNode) => {
              if (oldNode.tagName === "DIV") {
                oldNode.querySelector("input").value = "client";
              }
            },
          },
        });
        // the div was equal and clean at skip time, so the mutated input inside it was never visited
        initial.querySelector("input").value.should.equal("client");
      });
    });

    describe("ancestors of unskippable nodes are not skipped", function () {
      it("resets a typed input nested inside an otherwise equal subtree", function () {
        const initial = make(`<div><p><input></p></div>`);
        initial.querySelector("input").value = "typed";
        Idiomorph.morph(initial, `<div><p><input></p></div>`, {
          skipUnchanged: true,
        });
        initial.querySelector("input").value.should.equal("");
      });

      it("resets two typed inputs under the same parent", function () {
        const initial = make(`<div><input><input></div>`);
        const [first, second] = initial.querySelectorAll("input");
        first.value = "one";
        second.value = "two";
        Idiomorph.morph(initial, `<div><input><input></div>`, {
          skipUnchanged: true,
        });
        first.value.should.equal("");
        second.value.should.equal("");
      });

      it("morphs a template whose content differs", function () {
        const initial = make(`<div><template><b>A</b></template></div>`);
        Idiomorph.morph(initial, `<div><template><b>B</b></template></div>`, {
          skipUnchanged: true,
        });
        initial.querySelector("template").innerHTML.should.equal(`<b>B</b>`);
      });

      it("resets a typed input inside template content", function () {
        const initial = make(`<div><template><input></template></div>`);
        initial.querySelector("template").content.querySelector("input").value =
          "typed";
        Idiomorph.morph(initial, `<div><template><input></template></div>`, {
          skipUnchanged: true,
        });
        initial
          .querySelector("template")
          .content.querySelector("input")
          .value.should.equal("");
      });

      it("morphs a nested template inside template content", function () {
        const initial = make(
          `<div><template><p><template><b>A</b></template></p></template></div>`,
        );
        Idiomorph.morph(
          initial,
          `<div><template><p><template><b>B</b></template></p></template></div>`,
          { skipUnchanged: true },
        );
        initial
          .querySelector("template")
          .content.querySelector("template")
          .innerHTML.should.equal(`<b>B</b>`);
      });
    });

    describe("head handling keeps its side effects", function () {
      it("re-appends im-re-append elements in an otherwise equal document", function () {
        const html =
          "<html><head><title im-re-append='true'>Foo</title></head><body></body></html>";
        const doc = parseHTML(html);
        const originalHead = doc.head;
        const originalTitle = originalHead.children[0];
        Idiomorph.morph(doc, html, { skipUnchanged: true });
        originalHead.should.equal(doc.head);
        originalHead.children.length.should.equal(1);
        originalHead.children[0].outerHTML.should.equal(
          '<title im-re-append="true">Foo</title>',
        );
        originalHead.children[0].should.not.equal(originalTitle);
      });

      it("skips the body of an equal document while still visiting the head", function () {
        const calls = [];
        const html =
          "<html><head><title>Foo</title></head><body><p><b>x</b></p></body></html>";
        const doc = parseHTML(html);
        Idiomorph.morph(doc, html, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls
          .filter(
            ([, label]) => label.startsWith("<p>") || label.startsWith("<b>"),
          )
          .should.eql([]);
        calls
          .some(([, label]) => label.startsWith("<head>"))
          .should.equal(true);
      });
    });

    describe("root shapes", function () {
      for (const kind of ["Text", "Comment"]) {
        it(`morphs a ${kind.toLowerCase()} root with skipping enabled`, function () {
          const factory = kind === "Text" ? "createTextNode" : "createComment";
          const root = document[factory]("old");
          getWorkArea().append(root);
          Idiomorph.morph(root, document[factory]("new"), {
            skipUnchanged: true,
          });
          root.nodeValue.should.equal("new");
        });
      }

      it("resets a dirty input inside an equal subtree from another realm", function () {
        const iframe = document.createElement("iframe");
        getWorkArea().append(iframe);
        const doc = iframe.contentDocument;
        const html = `<div><input value="default"></div>`;
        doc.body.innerHTML = html;
        const root = doc.body.firstElementChild;
        const input = root.querySelector("input");
        input.value = "typed";
        Idiomorph.morph(root, html, { skipUnchanged: true });
        input.value.should.equal("default");
      });

      it("scans string content (template fragment root without matches)", function () {
        // the dirty input sits under an equal <p>, so only the pre-scan of the parsed
        // fragment can stop the <p> from being skipped
        const initial = make(`<div><p><input></p></div>`);
        initial.querySelector("input").value = "typed";
        Idiomorph.morph(initial, `<p><input></p>`, {
          morphStyle: "innerHTML",
          skipUnchanged: true,
        });
        initial.querySelector("input").value.should.equal("");
      });

      it("scans a new node that has siblings (SlicedParentNode root)", function () {
        const initial = make(`<div><input value="a"></div>`);
        const wrapper = make(
          `<section><div><input value="a"></div><span></span></section>`,
        );
        const final = wrapper.firstElementChild;
        final.querySelector("input").value = "b";
        Idiomorph.morph(initial, final, { skipUnchanged: true });
        initial.querySelector("input").value.should.equal("b");
      });

      it("checks the old root itself when it is a dirty control (outerHTML morph)", function () {
        // the pre-scan must include the root: querySelectorAll excludes it
        const attributeCalls = [];
        const parent = make(`<div><input></div>`);
        const input = parent.querySelector("input");
        input.value = "typed";
        Idiomorph.morph(input, `<input>`, {
          skipUnchanged: true,
          callbacks: {
            // neutralise the skip-time re-check so only the pre-scan can catch this
            beforeNodeMorphed: (oldNode) => {
              if (oldNode.tagName === "INPUT") oldNode.value = "";
            },
            beforeAttributeUpdated: (name, node, type) => {
              attributeCalls.push([name, type]);
            },
          },
        });
        // syncInputValue ran (it asks before removing the value attribute); a skip would never ask
        attributeCalls.should.eql([["value", "remove"]]);
      });
    });

    describe("interplay with other options", function () {
      it("ignoreActive still wins over skipUnchanged", function () {
        getWorkArea().append(make(`<div><input id="active" class="a"></div>`));
        const input = document.getElementById("active");
        input.focus();
        input.value = "typed";
        Idiomorph.morph(
          getWorkArea(),
          `<div><input id="active" class="b"></div>`,
          { morphStyle: "innerHTML", skipUnchanged: true, ignoreActive: true },
        );
        input.getAttribute("class").should.equal("a");
        input.value.should.equal("typed");
      });
    });

    describe("sibling options coupled through implicit selection", function () {
      it("selects the first option when a later option's explicit selection is removed", function () {
        // neither option's own markup changes match isUnskippable's per-node check: the
        // first option was never dirty, and the second option's own selectedness (now
        // false either way) matches its own new-side default too. Only comparing the
        // live `selected` property across the pair reveals that the first option's
        // effective selectedness has changed as a side effect of the second option's
        // attribute being removed.
        const select = make(
          `<select><option value="a">A</option><option value="b" selected>B</option></select>`,
        );
        Idiomorph.morph(
          select,
          `<select><option value="a">A</option><option value="b">B</option></select>`,
          { skipUnchanged: true },
        );
        select.value.should.equal("a");
        select.outerHTML.should.equal(
          `<select><option value="a" selected="">A</option><option value="b">B</option></select>`,
        );
      });
    });

    describe("a cleared single-select is backed at the select level", function () {
      // A single-select whose selection was cleared (selectedIndex = -1) has no
      // option whose own `selected` differs from its own default, so the
      // per-option check cannot see it; only comparing the select's live
      // selectedIndex against the effective parse default reveals the dirtiness.
      // The invariant: morphing with skipUnchanged on must produce the same DOM
      // as morphing with it off, which re-applies the implicit selection.
      // Built with DOM APIs so the fixtures are portable to WebKit (which
      // leaves select.options empty for markup parsed in a detached fragment).
      function buildDivSelect(specs) {
        const div = document.createElement("div");
        const select = document.createElement("select");
        for (const spec of specs) {
          const option = document.createElement("option");
          option.textContent = spec.text;
          if (spec.disabled) option.disabled = true;
          if (spec.selectedAttr) option.setAttribute("selected", "");
          select.appendChild(option);
        }
        div.appendChild(select);
        return div;
      }

      it("re-selects the implicit first option of a cleared single-select", function () {
        const div = buildDivSelect([{ text: "a" }, { text: "b" }]);
        const html = div.outerHTML;
        div.querySelector("select").selectedIndex = -1;
        Idiomorph.morph(div, html, { skipUnchanged: true });
        div.querySelector("select").selectedIndex.should.equal(0);
      });

      it("re-selects the first enabled option of a cleared single-select whose first option is disabled", function () {
        const div = buildDivSelect([
          { text: "a", disabled: true },
          { text: "b" },
        ]);
        const html = div.outerHTML;
        div.querySelector("select").selectedIndex = -1;
        Idiomorph.morph(div, html, { skipUnchanged: true });
        div.querySelector("select").selectedIndex.should.equal(1);
      });

      it("still skips a genuinely clean single-select", function () {
        const calls = [];
        const div = buildDivSelect([{ text: "a" }, { text: "b" }]);
        const html = div.outerHTML;
        Idiomorph.morph(div, html, {
          skipUnchanged: true,
          callbacks: recordingCallbacks(calls),
        });
        calls.should.eql([
          ["before", html],
          ["after", html],
        ]);
      });
    });
  });
});
