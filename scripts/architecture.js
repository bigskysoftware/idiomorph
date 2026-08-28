import ts from "typescript";
import fs from "node:fs";

const SOURCE = "src/idiomorph.js";
const DOC = "ARCHITECTURE.md";
const BEGIN = "<!-- begin generated graph -->";
const END = "<!-- end generated graph -->";
const FILLS = ["#eaf0fa", "#e9f4ec", "#fbf0e2", "#f2ecf8", "#fbecec"];

const source = ts.createSourceFile(
  SOURCE,
  fs.readFileSync(SOURCE, "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.JS,
);

const declarations = [];
let closureCount = 0;

const closure = (name, parent) => ({
  id: `c${closureCount++}`,
  name,
  parent,
  names: new Map(),
  children: [],
});

// a function, a class, or each declarator of a `const a = ..., b = ...`
const namedBy = (statement) =>
  ts.isVariableStatement(statement)
    ? statement.declarationList.declarations
    : statement.name
      ? [statement]
      : [];

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
  .filter(ts.isVariableStatement)
  .flatMap((statement) => statement.declarationList.declarations)
  .find((declaration) => bodyOfIife(declaration.initializer));
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

// mermaid paints no background of its own, so the graph sits on a card that
// stays legible under either github theme
const lines = [
  '%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#1f2328","primaryBorderColor":"#8c959f","lineColor":"#7c8794","fontSize":"14px"}}}%%',
  "flowchart LR",
  '  subgraph card[" "]',
  "    direction LR",
];
const styles = [];

(function emit(scope, depth) {
  const pad = "  ".repeat(depth);
  for (const { name, scope: owner } of declarations) {
    if (owner === scope) lines.push(`${pad}${name}("${name}")`);
  }
  for (const child of scope.children) {
    const fill = FILLS[styles.length % FILLS.length];
    styles.push(
      `  style ${child.id} fill:${fill},stroke:#c3cad3,color:#3d444d`,
    );
    lines.push(`${pad}subgraph ${child.id}["${child.name}"]`);
    emit(child, depth + 1);
    lines.push(`${pad}end`);
  }
})(root, 2);
lines.push("  end");

const crossing = [];
[...references.values()].forEach(([from, to], edge) => {
  lines.push(`  ${from.name} --> ${to.name}`);
  if (from.scope !== to.scope) crossing.push(edge);
});

lines.push(
  ...styles,
  "  style card fill:#ffffff,stroke:#ffffff",
  "  linkStyle default stroke:#7c8794,stroke-width:1.5px",
  `  linkStyle ${crossing.join(",")} stroke:#c2410c,stroke-width:2px`,
);

const doc = fs.readFileSync(DOC, "utf8");
const start = doc.indexOf(BEGIN);
const end = doc.indexOf(END);
if (start < 0 || end < 0)
  throw new Error(`${DOC} is missing its graph markers`);
fs.writeFileSync(
  DOC,
  `${doc.slice(0, start)}${BEGIN}\n\n\`\`\`mermaid\n${lines.join("\n")}\n\`\`\`\n\n${doc.slice(end)}`,
);

console.log(
  `${DOC}: ${references.size} references, ${crossing.length} crossing a closure boundary`,
);
