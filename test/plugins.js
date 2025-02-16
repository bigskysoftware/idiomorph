const toString = (node) => node.outerHTML || node.textContent;

function buildLoggingPlugin(name, log) {
  return {
    name,
    beforeNodeAdded: function (node) {
      log.push([`${name}:beforeNodeAdded`, toString(node)]);
    },
    afterNodeAdded: function (node) {
      log.push([`${name}:afterNodeAdded`, toString(node)]);
    },
    beforeNodeRemoved: function (node) {
      log.push([`${name}:beforeNodeRemoved`, toString(node)]);
    },
    afterNodeRemoved: function (node) {
      log.push([`${name}:afterNodeRemoved`, toString(node)]);
    },
    beforeNodeMorphed: function (oldNode, newNode) {
      log.push([
        `${name}:beforeNodeMorphed`,
        toString(oldNode),
        toString(newNode),
      ]);
    },
    afterNodeMorphed: function (oldNode, newNode) {
      log.push([
        `${name}:afterNodeMorphed`,
        toString(oldNode),
        toString(newNode),
      ]);
    },
  };
}

describe("Plugin system", function () {
  setup();

  it("can add plugins", function () {
    let log = [];
    const plugin = buildLoggingPlugin("foo", log);
    Idiomorph.addPlugin(plugin);

    Idiomorph.morph(make(`<p><br><a>A</a></p>`), `<hr><a>B</a>`, {
      morphStyle: "innerHTML",
    });

    log.should.eql([
      ["foo:beforeNodeAdded", "<hr>"],
      ["foo:afterNodeAdded", "<hr>"],
      ["foo:beforeNodeRemoved", "<br>"],
      ["foo:afterNodeRemoved", "<br>"],
      ["foo:beforeNodeMorphed", "<a>A</a>", "<a>B</a>"],
      ["foo:beforeNodeMorphed", "A", "B"],
      ["foo:afterNodeMorphed", "B", "B"],
      ["foo:afterNodeMorphed", "<a>B</a>", "<a>B</a>"],
    ]);
  });

  it("can add multiple plugins", function () {
    let log = [];
    const fooPlugin = buildLoggingPlugin("foo", log);
    const barPlugin = buildLoggingPlugin("bar", log);
    Idiomorph.addPlugin(fooPlugin);
    Idiomorph.addPlugin(barPlugin);

    Idiomorph.morph(make(`<p><br><a>A</a></p>`), `<hr><a>B</a>`, {
      morphStyle: "innerHTML",
    });

    log.should.eql([
      ["foo:beforeNodeAdded", "<hr>"],
      ["bar:beforeNodeAdded", "<hr>"],
      ["bar:afterNodeAdded", "<hr>"],
      ["foo:afterNodeAdded", "<hr>"],
      ["foo:beforeNodeRemoved", "<br>"],
      ["bar:beforeNodeRemoved", "<br>"],
      ["bar:afterNodeRemoved", "<br>"],
      ["foo:afterNodeRemoved", "<br>"],
      ["foo:beforeNodeMorphed", "<a>A</a>", "<a>B</a>"],
      ["bar:beforeNodeMorphed", "<a>A</a>", "<a>B</a>"],
      ["foo:beforeNodeMorphed", "A", "B"],
      ["bar:beforeNodeMorphed", "A", "B"],
      ["bar:afterNodeMorphed", "B", "B"],
      ["foo:afterNodeMorphed", "B", "B"],
      ["bar:afterNodeMorphed", "<a>B</a>", "<a>B</a>"],
      ["foo:afterNodeMorphed", "<a>B</a>", "<a>B</a>"],
    ]);
  });

  it("can add multiple plugins alongside callbacks", function () {
    let log = [];
    const fooPlugin = buildLoggingPlugin("foo", log);
    const barPlugin = buildLoggingPlugin("bar", log);
    Idiomorph.addPlugin(fooPlugin);
    Idiomorph.addPlugin(barPlugin);

    Idiomorph.morph(make(`<p><br><a>A</a></p>`), `<hr><a>B</a>`, {
      morphStyle: "innerHTML",
      callbacks: {
        beforeNodeAdded: function (node) {
          log.push([`beforeNodeAdded`, toString(node)]);
        },
        afterNodeAdded: function (node) {
          log.push([`afterNodeAdded`, toString(node)]);
        },
        beforeNodeRemoved: function (node) {
          log.push([`beforeNodeRemoved`, toString(node)]);
        },
        afterNodeRemoved: function (node) {
          log.push([`afterNodeRemoved`, toString(node)]);
        },
        beforeNodeMorphed: function (oldNode, newNode) {
          log.push([`beforeNodeMorphed`, toString(oldNode), toString(newNode)]);
        },
        afterNodeMorphed: function (oldNode, newNode) {
          log.push([`afterNodeMorphed`, toString(oldNode), toString(newNode)]);
        },
      },
    });

    log.should.eql([
      ["foo:beforeNodeAdded", "<hr>"],
      ["bar:beforeNodeAdded", "<hr>"],
      ["beforeNodeAdded", "<hr>"],
      ["afterNodeAdded", "<hr>"],
      ["bar:afterNodeAdded", "<hr>"],
      ["foo:afterNodeAdded", "<hr>"],
      ["foo:beforeNodeRemoved", "<br>"],
      ["bar:beforeNodeRemoved", "<br>"],
      ["beforeNodeRemoved", "<br>"],
      ["afterNodeRemoved", "<br>"],
      ["bar:afterNodeRemoved", "<br>"],
      ["foo:afterNodeRemoved", "<br>"],
      ["foo:beforeNodeMorphed", "<a>A</a>", "<a>B</a>"],
      ["bar:beforeNodeMorphed", "<a>A</a>", "<a>B</a>"],
      ["beforeNodeMorphed", "<a>A</a>", "<a>B</a>"],
      ["foo:beforeNodeMorphed", "A", "B"],
      ["bar:beforeNodeMorphed", "A", "B"],
      ["beforeNodeMorphed", "A", "B"],
      ["afterNodeMorphed", "B", "B"],
      ["bar:afterNodeMorphed", "B", "B"],
      ["foo:afterNodeMorphed", "B", "B"],
      ["afterNodeMorphed", "<a>B</a>", "<a>B</a>"],
      ["bar:afterNodeMorphed", "<a>B</a>", "<a>B</a>"],
      ["foo:afterNodeMorphed", "<a>B</a>", "<a>B</a>"],
    ]);
  });

  it("the first beforeNodeAdded => false halts the entire operation", function () {
    let log = [];

    Idiomorph.addPlugin({
      name: "foo",
      beforeNodeAdded: function (node) {
        log.push(["foo:beforeNodeAdded", node.outerHTML]);
        return false;
      },
      afterNodeAdded: function (node) {
        log.push(["foo:afterNodeAdded", node.outerHTML]);
      },
    });

    Idiomorph.addPlugin({
      name: "bar",
      beforeNodeAdded: function (node) {
        log.push(["bar:beforeNodeAdded", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        log.push(["bar:afterNodeAdded", node.outerHTML]);
      },
    });

    Idiomorph.morph(make("<p>"), "<p><hr>", {
      callbacks: {
        beforeNodeAdded: function (node) {
          log.push(["beforeNodeAddedCallback", node.outerHTML]);
        },
        afterNodeAdded: function (node) {
          log.push(["afterNodeAddedCallback", node.outerHTML]);
        },
      },
    });

    log.should.eql([["foo:beforeNodeAdded", "<hr>"]]);
  });

  it("the first beforeNodeRemoved => false halts the entire operation", function () {
    let log = [];

    Idiomorph.addPlugin({
      name: "foo",
      beforeNodeRemoved: function (node) {
        log.push(["foo:beforeNodeRemoved", node.outerHTML]);
        return false;
      },
      afterNodeRemoved: function (node) {
        log.push(["foo:afterNodeRemoved", node.outerHTML]);
      },
    });

    Idiomorph.addPlugin({
      name: "bar",
      beforeNodeRemoved: function (node) {
        log.push(["bar:beforeNodeRemoved2", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        log.push(["bar:afterNodeRemoved2", node.outerHTML]);
      },
    });

    Idiomorph.morph(make("<br>"), "<hr>", {
      callbacks: {
        beforeNodeRemoved: function (node) {
          log.push(["beforeNodeRemoved", node.outerHTML]);
        },
        afterNodeRemoved: function (node) {
          log.push(["afterNodeRemoved", node.outerHTML]);
        },
      },
    });

    log.should.eql([["foo:beforeNodeRemoved", "<br>"]]);
  });

  it("plugin callbacks are not all required to exist", function () {
    let log = [];

    Idiomorph.addPlugin({
      name: "foo",
      beforeNodeAdded: function (node) {
        log.push(["foo:beforeNodeAdded", node.outerHTML]);
      },
      afterNodeAdded: function (node) {
        log.push(["foo:afterNodeAdded", node.outerHTML]);
      },
    });

    Idiomorph.addPlugin({ name: "bar" });

    Idiomorph.morph(make("<br>"), "<hr>", {
      callbacks: {
        beforeNodeAdded: function (node) {
          log.push(["beforeNodeAdded", node.outerHTML]);
        },
        afterNodeAdded: function (node) {
          log.push(["afterNodeAdded", node.outerHTML]);
        },
      },
    });

    log.should.eql([
      ["foo:beforeNodeAdded", "<hr>"],
      ["beforeNodeAdded", "<hr>"],
      ["afterNodeAdded", "<hr>"],
      ["foo:afterNodeAdded", "<hr>"],
    ]);
  });
});
