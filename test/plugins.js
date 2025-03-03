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
    beforeAttributeUpdated: function (attribute, node, updateType) {
      log.push([
        `${name}:beforeAttributeUpdated`,
        toString(node),
        attribute,
        updateType,
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

    Idiomorph.morph(
      make(`<p><br><a name="a" old="">A</a></p>`),
      `<hr><a name="b" new="">B</a>`,
      {
        morphStyle: "innerHTML",
      },
    );

    log.should.eql([
      ["foo:beforeNodeAdded", "<hr>"],
      ["foo:afterNodeAdded", "<hr>"],
      ["foo:beforeNodeRemoved", "<br>"],
      ["foo:afterNodeRemoved", "<br>"],
      [
        "foo:beforeNodeMorphed",
        `<a name="a" old="">A</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "foo:beforeAttributeUpdated",
        `<a name="a" old="">A</a>`,
        "name",
        "update",
      ],
      [
        "foo:beforeAttributeUpdated",
        `<a name="b" old="">A</a>`,
        "new",
        "update",
      ],
      [
        "foo:beforeAttributeUpdated",
        `<a name="b" old="" new="">A</a>`,
        "old",
        "remove",
      ],
      ["foo:beforeNodeMorphed", "A", "B"],
      ["foo:afterNodeMorphed", "B", "B"],
      [
        "foo:afterNodeMorphed",
        `<a name="b" new="">B</a>`,
        `<a name="b" new="">B</a>`,
      ],
    ]);
  });

  it("can add multiple plugins", function () {
    let log = [];
    const fooPlugin = buildLoggingPlugin("foo", log);
    const barPlugin = buildLoggingPlugin("bar", log);
    Idiomorph.addPlugin(fooPlugin);
    Idiomorph.addPlugin(barPlugin);

    Idiomorph.morph(
      make(`<p><br><a name="a" old="">A</a></p>`),
      `<hr><a name="b" new="">B</a>`,
      {
        morphStyle: "innerHTML",
      },
    );

    log.should.eql([
      ["foo:beforeNodeAdded", "<hr>"],
      ["bar:beforeNodeAdded", "<hr>"],
      ["bar:afterNodeAdded", "<hr>"],
      ["foo:afterNodeAdded", "<hr>"],
      ["foo:beforeNodeRemoved", "<br>"],
      ["bar:beforeNodeRemoved", "<br>"],
      ["bar:afterNodeRemoved", "<br>"],
      ["foo:afterNodeRemoved", "<br>"],
      [
        "foo:beforeNodeMorphed",
        `<a name="a" old="">A</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "bar:beforeNodeMorphed",
        `<a name="a" old="">A</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "foo:beforeAttributeUpdated",
        `<a name="a" old="">A</a>`,
        "name",
        "update",
      ],
      [
        "bar:beforeAttributeUpdated",
        `<a name="a" old="">A</a>`,
        "name",
        "update",
      ],
      [
        "foo:beforeAttributeUpdated",
        `<a name="b" old="">A</a>`,
        "new",
        "update",
      ],
      [
        "bar:beforeAttributeUpdated",
        `<a name="b" old="">A</a>`,
        "new",
        "update",
      ],
      [
        "foo:beforeAttributeUpdated",
        `<a name="b" old="" new="">A</a>`,
        "old",
        "remove",
      ],
      [
        "bar:beforeAttributeUpdated",
        `<a name="b" old="" new="">A</a>`,
        "old",
        "remove",
      ],
      ["foo:beforeNodeMorphed", "A", "B"],
      ["bar:beforeNodeMorphed", "A", "B"],
      ["bar:afterNodeMorphed", "B", "B"],
      ["foo:afterNodeMorphed", "B", "B"],
      [
        "bar:afterNodeMorphed",
        `<a name="b" new="">B</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "foo:afterNodeMorphed",
        `<a name="b" new="">B</a>`,
        `<a name="b" new="">B</a>`,
      ],
    ]);
  });

  it("can add multiple plugins alongside callbacks", function () {
    let log = [];
    const fooPlugin = buildLoggingPlugin("foo", log);
    const barPlugin = buildLoggingPlugin("bar", log);
    Idiomorph.addPlugin(fooPlugin);
    Idiomorph.addPlugin(barPlugin);

    Idiomorph.morph(
      make(`<p><br><a name="a" old="">A</a></p>`),
      `<hr><a name="b" new="">B</a>`,
      {
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
            log.push([
              `beforeNodeMorphed`,
              toString(oldNode),
              toString(newNode),
            ]);
          },
          afterNodeMorphed: function (oldNode, newNode) {
            log.push([
              `afterNodeMorphed`,
              toString(oldNode),
              toString(newNode),
            ]);
          },
          beforeAttributeUpdated: function (attribute, node, updateType) {
            log.push([
              `beforeAttributeUpdated`,
              toString(node),
              attribute,
              updateType,
            ]);
          },
        },
      },
    );

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
      [
        "foo:beforeNodeMorphed",
        `<a name="a" old="">A</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "bar:beforeNodeMorphed",
        `<a name="a" old="">A</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "beforeNodeMorphed",
        `<a name="a" old="">A</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "foo:beforeAttributeUpdated",
        `<a name="a" old="">A</a>`,
        "name",
        "update",
      ],
      [
        "bar:beforeAttributeUpdated",
        `<a name="a" old="">A</a>`,
        "name",
        "update",
      ],
      ["beforeAttributeUpdated", `<a name="a" old="">A</a>`, "name", "update"],
      [
        "foo:beforeAttributeUpdated",
        `<a name="b" old="">A</a>`,
        "new",
        "update",
      ],
      [
        "bar:beforeAttributeUpdated",
        `<a name="b" old="">A</a>`,
        "new",
        "update",
      ],
      ["beforeAttributeUpdated", `<a name="b" old="">A</a>`, "new", "update"],
      [
        "foo:beforeAttributeUpdated",
        `<a name="b" old="" new="">A</a>`,
        "old",
        "remove",
      ],
      [
        "bar:beforeAttributeUpdated",
        `<a name="b" old="" new="">A</a>`,
        "old",
        "remove",
      ],
      [
        "beforeAttributeUpdated",
        `<a name="b" old="" new="">A</a>`,
        "old",
        "remove",
      ],
      ["foo:beforeNodeMorphed", "A", "B"],
      ["bar:beforeNodeMorphed", "A", "B"],
      ["beforeNodeMorphed", "A", "B"],
      ["afterNodeMorphed", "B", "B"],
      ["bar:afterNodeMorphed", "B", "B"],
      ["foo:afterNodeMorphed", "B", "B"],
      [
        "afterNodeMorphed",
        `<a name="b" new="">B</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "bar:afterNodeMorphed",
        `<a name="b" new="">B</a>`,
        `<a name="b" new="">B</a>`,
      ],
      [
        "foo:afterNodeMorphed",
        `<a name="b" new="">B</a>`,
        `<a name="b" new="">B</a>`,
      ],
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

  it("the first beforeNodeMorphed => false halts the entire operation", function () {
    let log = [];

    Idiomorph.addPlugin({
      name: "foo",
      beforeNodeMorphed: function (node) {
        log.push(["foo:beforeNodeMorphed", node.outerHTML]);
        return false;
      },
      afterNodeMorphed: function (node) {
        log.push(["foo:afterNodeMorphed", node.outerHTML]);
      },
    });

    Idiomorph.addPlugin({
      name: "bar",
      beforeNodeMorphed: function (node) {
        log.push(["bar:beforeNodeMorphed", node.outerHTML]);
      },
      afterNodeMorphed: function (node) {
        log.push(["bar:afterNodeMorphed", node.outerHTML]);
      },
    });

    Idiomorph.morph(make(`<hr name="a">`), `<hr name="b">`, {
      callbacks: {
        beforeNodeMorphed: function (node) {
          log.push(["beforeNodeMorphed", node.outerHTML]);
        },
        afterNodeMorphed: function (node) {
          log.push(["afterNodeMorphed", node.outerHTML]);
        },
      },
    });

    log.should.eql([["foo:beforeNodeMorphed", `<hr name="a">`]]);
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
        log.push(["bar:beforeNodeRemoved", node.outerHTML]);
      },
      afterNodeRemoved: function (node) {
        log.push(["bar:afterNodeRemoved", node.outerHTML]);
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

  it("the first beforeAttributeUpdated => false halts the entire operation", function () {
    let log = [];

    Idiomorph.addPlugin({
      name: "foo",
      beforeAttributeUpdated: function (attr, node, updateType) {
        log.push(["foo:beforeAttributeUpdated", node.outerHTML]);
        return false;
      },
    });

    Idiomorph.addPlugin({
      name: "bar",
      beforeAttributeUpdated: function (attr, node, updateType) {
        log.push(["bar:beforeAttributeUpdated", node.outerHTML]);
      },
    });

    Idiomorph.morph(make(`<hr name="a">`), `<hr name="b">`, {
      callbacks: {
        beforeAttributeUpdated: function (attr, node, updateType) {
          log.push(["beforeAttributeUpdated", node.outerHTML]);
        },
      },
    });

    log.should.eql([["foo:beforeAttributeUpdated", `<hr name="a">`]]);
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
