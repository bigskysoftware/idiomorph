import { instance } from "@viz-js/viz";
import ts from "typescript";
import fs from "node:fs";

const SOURCE = "src/idiomorph.js";
const IMAGE = "img/architecture.svg";
const FILLS = ["#eaf0fa", "#e9f4ec", "#fbf0e2", "#f2ecf8", "#fbecec"];

const source = ts.createSourceFile(
  SOURCE,
  fs.readFileSync(SOURCE, "utf8"),
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

const lines = [
  "digraph architecture {",
  '  bgcolor="#ffffff";',
  "  rankdir=LR; compound=true;",
  '  graph [fontname="Helvetica", fontsize=13, margin=0];',
  '  node [fontname="Helvetica", fontsize=11, shape=box, height=0.34, style="rounded,filled", fillcolor="#ffffff", color="#8c959f"];',
  '  edge [color="#7c8794", arrowsize=0.7, penwidth=1.2];',
];
let clusters = 0;

(function emit(scope, depth) {
  const pad = "  ".repeat(depth);
  for (const { name, scope: owner } of declarations) {
    if (owner === scope) lines.push(`${pad}"${name}";`);
  }
  for (const child of scope.children) {
    const fill = FILLS[clusters % FILLS.length];
    lines.push(
      `${pad}subgraph cluster_${clusters++} {`,
      `${pad}  label="${child.name}"; margin=14; style="rounded,filled"; fillcolor="${fill}"; color="#c3cad3"; fontcolor="#3d444d";`,
    );
    emit(child, depth + 1);
    lines.push(`${pad}}`);
  }
})(root, 1);

for (const [from, to] of references.values()) {
  const crosses = from.scope !== to.scope;
  lines.push(
    `  "${from.name}" -> "${to.name}"${crosses ? ' [color="#c2410c", penwidth=1.8]' : ""};`,
  );
}
lines.push("}");

const crossing = [...references.values()].filter(
  ([a, b]) => a.scope !== b.scope,
);

const viz = await instance();
fs.writeFileSync(IMAGE, viz.renderString(lines.join("\n"), { format: "svg" }));

console.log(
  `${IMAGE}: ${references.size} references, ${crossing.length} crossing a closure boundary`,
);
