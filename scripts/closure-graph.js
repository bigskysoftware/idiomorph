import { parse } from "espree";
import { analyze } from "eslint-scope";
import fs from "node:fs";

// Reads a library written as nested IIFE closures and reports every declaration
// in it, outermost first. A declaration with `children` is itself a closure; the
// rest are leaves, and each one's `references` are the declarations it names.
export function closureGraph(file) {
  const ecmaVersion = "latest";
  const source = fs.readFileSync(file, "utf8");
  const manager = analyze(parse(source, { ecmaVersion, range: true }), {
    ecmaVersion,
  });

  // `const x = (function () { ... })()` — the call's callee is the closure body
  const iifeCallee = (variable) => {
    const init = variable.defs[0]?.node.init;
    return init?.callee?.type === "FunctionExpression" ? init.callee : null;
  };

  const byVariable = new Map();

  function collect(body, scope) {
    const nested = new Map();
    for (const variable of manager.acquire(body).variables) {
      const callee = iifeCallee(variable);
      if (callee) {
        nested.set(callee, [...(nested.get(callee) ?? []), variable]);
      } else if (variable.defs.length) {
        const { name } = variable;
        const declaration = { name, variable, scope, references: new Set() };
        scope.children.push(declaration);
        byVariable.set(variable, declaration);
      }
    }
    for (const [callee, exported] of nested) {
      const name = exported.map(({ name }) => name).join(" · ");
      const child = { name, scope, children: [], references: new Set() };
      scope.children.push(child);
      collect(callee, child);
      // the closure hands these back, so they stay reachable out here by name
      for (const variable of exported) {
        const inner = child.children.find(({ name }) => name === variable.name);
        byVariable.set(variable, inner);
      }
    }
  }

  const outermost = manager.globalScope.variables.find(iifeCallee);
  const root = { name: outermost.name, children: [], references: new Set() };
  collect(iifeCallee(outermost), root);

  const flatten = (each) => [each, ...(each.children ?? []).flatMap(flatten)];
  const declarations = flatten(root);
  const leaves = declarations.filter(({ children }) => !children);

  // a reference belongs to whichever declaration's source range encloses it
  const encloses = ({ variable }, node) => {
    const [start, end] = variable.defs[0].node.range;
    return start <= node.range[0] && node.range[1] <= end;
  };

  for (const scope of manager.scopes) {
    for (const { identifier, resolved } of scope.references) {
      const to = byVariable.get(resolved);
      const from = leaves.find((each) => encloses(each, identifier));
      if (to && from && to !== from) from.references.add(to);
    }
  }

  return declarations;
}
