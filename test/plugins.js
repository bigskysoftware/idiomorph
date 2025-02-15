describe("Plugin system", function () {
  setup();

  it("can add plugins", function () {
    let calls = [];

    const plugin = {
      name: "foo",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded", node.outerHTML]);
      },
      beforeNodeRemoved: function (node) {
        calls.push(["beforeNodeRemoved", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        calls.push(["afterNodeRemoved", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin);

    Idiomorph.morph(make("<br>"), "<hr>");

    calls.should.eql([
      ["beforeNodeAdded", "<hr>"],
      ["afterNodeAdded", "<hr>"],
      ["beforeNodeRemoved", "<br>"],
      ["afterNodeRemoved", "<br>"],
    ]);
  });

  it("can add multiple plugins", function () {
    let calls = [];

    const plugin1 = {
      name: "foo",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded1", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded1", node.outerHTML]);
      },
      beforeNodeRemoved: function (node) {
        calls.push(["beforeNodeRemoved1", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        calls.push(["afterNodeRemoved1", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin1);

    const plugin2 = {
      name: "bar",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded2", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded2", node.outerHTML]);
      },
      beforeNodeRemoved: function (node) {
        calls.push(["beforeNodeRemoved2", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        calls.push(["afterNodeRemoved2", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin2);

    Idiomorph.morph(make("<br>"), "<hr>");

    calls.should.eql([
      ["beforeNodeAdded1", "<hr>"],
      ["beforeNodeAdded2", "<hr>"],
      ["afterNodeAdded2", "<hr>"],
      ["afterNodeAdded1", "<hr>"],
      ["beforeNodeRemoved1", "<br>"],
      ["beforeNodeRemoved2", "<br>"],
      ["afterNodeRemoved2", "<br>"],
      ["afterNodeRemoved1", "<br>"],
    ]);
  });

  it("can add multiple plugins alongside callbacks", function () {
    let calls = [];

    const plugin1 = {
      name: "foo",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded1", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded1", node.outerHTML]);
      },
      beforeNodeRemoved: function (node) {
        calls.push(["beforeNodeRemoved1", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        calls.push(["afterNodeRemoved1", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin1);

    const plugin2 = {
      name: "bar",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded2", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded2", node.outerHTML]);
      },
      beforeNodeRemoved: function (node) {
        calls.push(["beforeNodeRemoved2", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        calls.push(["afterNodeRemoved2", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin2);

    Idiomorph.morph(make("<br>"), "<hr>", {
      callbacks: {
        beforeNodeAdded: function (node) {
          calls.push(["beforeNodeAddedCallback", node.outerHTML]);
        },
        afterNodeAdded: function (node) {
          calls.push(["afterNodeAddedCallback", node.outerHTML]);
        },
        beforeNodeRemoved: function (node) {
          calls.push(["beforeNodeRemovedCallback", node.outerHTML]);
        },
        afterNodeRemoved: function (node) {
          calls.push(["afterNodeRemovedCallback", node.outerHTML]);
        },
      },
    });

    calls.should.eql([
      ["beforeNodeAdded1", "<hr>"],
      ["beforeNodeAdded2", "<hr>"],
      ["beforeNodeAddedCallback", "<hr>"],
      ["afterNodeAddedCallback", "<hr>"],
      ["afterNodeAdded2", "<hr>"],
      ["afterNodeAdded1", "<hr>"],
      ["beforeNodeRemoved1", "<br>"],
      ["beforeNodeRemoved2", "<br>"],
      ["beforeNodeRemovedCallback", "<br>"],
      ["afterNodeRemovedCallback", "<br>"],
      ["afterNodeRemoved2", "<br>"],
      ["afterNodeRemoved1", "<br>"],
    ]);
  });

  it("the first beforeNodeAdded => false halts the entire operation", function () {
    let calls = [];

    const plugin1 = {
      name: "foo",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded1", node.outerHTML]);
        return false;
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded1", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin1);

    const plugin2 = {
      name: "bar",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded2", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded2", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin2);

    Idiomorph.morph(make("<p>"), "<p><hr>", {
      callbacks: {
        beforeNodeAdded: function (node) {
          calls.push(["beforeNodeAddedCallback", node.outerHTML]);
        },
        afterNodeAdded: function (node) {
          calls.push(["afterNodeAddedCallback", node.outerHTML]);
        },
      },
    });

    calls.should.eql([
      ["beforeNodeAdded1", "<hr>"]
    ]);
  });

  it("the first beforeNodeRemoved => false halts the entire operation", function () {
    let calls = [];

    const plugin1 = {
      name: "foo",
      beforeNodeRemoved: function (node) {
        calls.push(["beforeNodeRemoved1", node.outerHTML]);
        return false
      },
      afterNodeRemoved: function (node) {
        calls.push(["afterNodeRemoved1", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin1);

    const plugin2 = {
      name: "bar",
      beforeNodeRemoved: function (node) {
        calls.push(["beforeNodeRemoved2", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        calls.push(["afterNodeRemoved2", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin2);

    Idiomorph.morph(make("<br>"), "<hr>", {
      callbacks: {
        beforeNodeRemoved: function (node) {
          calls.push(["beforeNodeRemovedCallback", node.outerHTML]);
        },
        afterNodeRemoved: function (node) {
          calls.push(["afterNodeRemovedCallback", node.outerHTML]);
        },
      },
    });

    calls.should.eql([
      ["beforeNodeRemoved1", "<br>"]
    ]);
  });

  it("plugin callbacks are not all required to exist", function () {
    let calls = [];

    const plugin1 = {
      name: "foo",
      beforeNodeAdded: function (node) {
        calls.push(["beforeNodeAdded1", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        calls.push(["afterNodeAdded1", node.outerHTML]);
      },
    };
    Idiomorph.addPlugin(plugin1);

    const plugin2 = {
      name: "bar",
    };
    Idiomorph.addPlugin(plugin2);

    Idiomorph.morph(make("<br>"), "<hr>", {
      callbacks: {
        beforeNodeAdded: function (node) {
          calls.push(["beforeNodeAddedCallback", node.outerHTML]);
        },
        afterNodeAdded: function (node) {
          calls.push(["afterNodeAddedCallback", node.outerHTML]);
        },
      },
    });

    calls.should.eql([
      ["beforeNodeAdded1", "<hr>"],
      ["beforeNodeAddedCallback", "<hr>"],
      ["afterNodeAddedCallback", "<hr>"],
      ["afterNodeAdded1", "<hr>"],
    ]);
  });
});

