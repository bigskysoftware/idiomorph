import ts from "typescript";
import fs from "node:fs";

// Reads a library written as nested IIFE closures and reports what each closure
// declares, plus every reference between those declarations.
export function closureGraph(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

  const declarations = [];
  const closure = (name, parent) => ({
    name,
    parent,
    names: new Map(),
    children: [],
  });

  // a function, a class, or each declarator of a `const a = ..., b = ...`
  const namedBy = (statement) =>
    ts.isVariableStatement(statement)
      ? statement.declarationList.declarations
      : [statement].filter(({ name }) => name);

  function bodyOfIife(node) {
    if (!node || !ts.isCallExpression(node)) return null;
    let callee = node.expression;
    while (ts.isParenthesizedExpression(callee)) callee = callee.expression;
    return ts.isFunctionExpression(callee) ? callee.body : null;
  }

  function collect(body, scope) {
    for (const statement of body.statements) {
      for (const { name, initializer } of namedBy(statement)) {
        const names = ts.isIdentifier(name)
          ? [name.text]
          : name.elements.map((element) => element.name.text);
        const nested = bodyOfIife(initializer);
        if (!nested) {
          for (const each of names) {
            const declaration = { name: each, node: statement, scope };
            declarations.push(declaration);
            scope.names.set(each, declaration);
          }
          continue;
        }
        const child = closure(names.join(" · "), scope);
        scope.children.push(child);
        collect(nested, child);
        // the closure hands these back, so they stay reachable out here by name
        for (const each of names) scope.names.set(each, child.names.get(each));
      }
    }
  }

  function lookup(scope, name) {
    for (let s = scope; s; s = s.parent) {
      const found = s.names.get(name);
      if (found) return found;
    }
  }

  const outermost = source.statements
    .flatMap(namedBy)
    .find(({ initializer }) => bodyOfIife(initializer));
  const root = closure(outermost.name.text, null);
  collect(bodyOfIife(outermost.initializer), root);

  const references = new Map();
  for (const from of declarations) {
    (function visit(node) {
      // an identifier its parent calls `name` is being declared, not referenced
      if (ts.isIdentifier(node) && node.parent.name !== node) {
        const to = lookup(from.scope, node.text);
        if (to && to !== from)
          references.set(`${from.name} ${to.name}`, [from, to]);
      }
      ts.forEachChild(node, visit);
    })(from.node);
  }

  return { root, declarations, references };
}
