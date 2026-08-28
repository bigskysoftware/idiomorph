import ts from "typescript";
import fs from "node:fs";

const SOURCE = "src/idiomorph.js";
const DOC = "ARCHITECTURE.md";
const BEGIN = "<!-- begin generated graph -->";
const END = "<!-- end generated graph -->";

const FILLS = [
  "#eaf0fa",
  "#e9f4ec",
  "#fbf0e2",
  "#f2ecf8",
  "#fbecec",
  "#e9f3f5",
];

function analyze(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

  const decls = [];
  let scopeCount = 0;
  const scope = (name, parent) => ({
    id: `s${scopeCount++}`,
    name,
    parent,
    decls: new Map(),
    exports: new Map(),
    children: [],
  });

  function iifeOf(node) {
    if (!node || !ts.isCallExpression(node)) return null;
    let callee = node.expression;
    while (ts.isParenthesizedExpression(callee)) callee = callee.expression;
    const isFn = ts.isFunctionExpression(callee) || ts.isArrowFunction(callee);
    return isFn ? callee : null;
  }

  function declare(inScope, name, node, kind) {
    if (decls.some((d) => d.name === name)) {
      throw new Error(
        `duplicate declaration name ${name}; graph ids must be unique`,
      );
    }
    const decl = { name, node, kind, scope: inScope };
    decls.push(decl);
    inScope.decls.set(name, decl);
  }

  function collect(body, inScope) {
    for (const stmt of body.statements ?? []) {
      if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        declare(inScope, stmt.name.text, stmt, "function");
      } else if (ts.isClassDeclaration(stmt) && stmt.name) {
        declare(inScope, stmt.name.text, stmt, "class");
      } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          collectVariable(decl, stmt, inScope);
        }
      }
    }
  }

  function collectVariable(decl, stmt, inScope) {
    const iife = iifeOf(decl.initializer);
    if (iife) {
      const names = ts.isIdentifier(decl.name)
        ? [decl.name.text]
        : decl.name.elements.map((el) => el.name.text);
      const child = scope(names.join(" · "), inScope);
      inScope.children.push(child);
      collect(iife.body, child);
      // the closure's return value re-binds its exported members in the enclosing scope
      for (const name of names) {
        if (child.decls.has(name))
          inScope.exports.set(name, child.decls.get(name));
      }
    } else if (ts.isIdentifier(decl.name)) {
      const init = decl.initializer;
      const isFn =
        init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init));
      declare(inScope, decl.name.text, stmt, isFn ? "function" : "value");
    }
  }

  const outermost = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((stmt) => stmt.declarationList.declarations)
    .find((decl) => iifeOf(decl.initializer));
  if (!outermost) throw new Error(`no top level closure found in ${file}`);
  const root = scope(outermost.name.text, null);
  collect(iifeOf(outermost.initializer).body, root);

  function lookup(from, name) {
    for (let s = from; s; s = s.parent) {
      if (s.decls.has(name)) return s.decls.get(name);
      if (s.exports.has(name)) return s.exports.get(name);
    }
    return null;
  }

  const edges = [];
  const seen = new Set();
  for (const decl of decls) {
    const visit = (node) => {
      if (ts.isIdentifier(node) && !isPropertyName(node)) {
        const to = lookup(decl.scope, node.text);
        const key = `${decl.name} -> ${to?.name}`;
        if (to && to !== decl && !seen.has(key)) {
          seen.add(key);
          edges.push({ from: decl, to });
        }
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(decl.node, visit);
  }

  return { root, edges };
}

function isPropertyName(node) {
  const parent = node.parent;
  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isBindingElement(parent) && parent.propertyName === node)
  );
}

const SHAPES = {
  function: (name) => `${name}("${name}")`,
  class: (name) => `${name}[["${name}"]]`,
  value: (name) => `${name}[("${name}")]`,
};

function toMermaid({ root, edges }) {
  const lines = ["flowchart LR"];
  const styles = [];
  let fill = 0;

  const emit = (scope, depth) => {
    const pad = "  ".repeat(depth);
    for (const decl of scope.decls.values()) {
      lines.push(`${pad}${SHAPES[decl.kind](decl.name)}`);
    }
    for (const child of scope.children) {
      const color = FILLS[fill++ % FILLS.length];
      styles.push(
        `  style ${child.id} fill:${color},stroke:#c3cad3,color:#3d444d`,
      );
      lines.push(`${pad}subgraph ${child.id}["${child.name}"]`);
      emit(child, depth + 1);
      lines.push(`${pad}end`);
    }
  };
  emit(root, 1);

  const crossing = [];
  edges.forEach(({ from, to }, index) => {
    lines.push(`  ${from.name} --> ${to.name}`);
    if (from.scope !== to.scope) crossing.push(index);
  });

  lines.push(...styles);
  // mermaid requires the default link style before any indexed override
  lines.push("  linkStyle default stroke:#7c8794,stroke-width:1.5px");
  if (crossing.length) {
    lines.push(
      `  linkStyle ${crossing.join(",")} stroke:#c2410c,stroke-width:2px`,
    );
  }
  return lines.join("\n");
}

const graph = analyze(SOURCE);
const doc = fs.readFileSync(DOC, "utf8");
const start = doc.indexOf(BEGIN);
const end = doc.indexOf(END);
if (start < 0 || end < 0) {
  throw new Error(`${DOC} is missing its ${BEGIN} ${END} markers`);
}
const block = `${BEGIN}\n\n\`\`\`mermaid\n${toMermaid(graph)}\n\`\`\`\n\n`;
fs.writeFileSync(DOC, doc.slice(0, start) + block + doc.slice(end));
console.log(
  `${DOC}: ${graph.edges.length} references, ` +
    `${graph.edges.filter((e) => e.from.scope !== e.to.scope).length} crossing a closure boundary`,
);
