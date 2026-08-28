import { instance } from "@viz-js/viz";
import fs from "node:fs";
import { closureGraph } from "./closure-graph.js";

const SOURCE = "src/idiomorph.js";
const IMAGE = "img/architecture.svg";
const FILLS = ["#eaf0fa", "#e9f4ec", "#fbf0e2", "#f2ecf8", "#fbecec"];

const declarations = closureGraph(SOURCE);

const lines = [
  "digraph architecture {",
  '  bgcolor="#ffffff";',
  "  rankdir=LR; compound=true;",
  '  graph [fontname="Helvetica", fontsize=13, margin=0];',
  '  node [fontname="Helvetica", fontsize=11, shape=box, height=0.34, style="rounded,filled", fillcolor="#ffffff", color="#8c959f"];',
  '  edge [color="#7c8794", arrowsize=0.7, penwidth=1.2];',
];
let clusters = 0;

(function emit(closure, depth) {
  const pad = "  ".repeat(depth);
  for (const child of closure.children) {
    if (!child.children) {
      lines.push(`${pad}"${child.name}";`);
      continue;
    }
    const fill = FILLS[clusters % FILLS.length];
    lines.push(
      `${pad}subgraph cluster_${clusters++} {`,
      `${pad}  label="${child.name}"; margin=14; style="rounded,filled"; fillcolor="${fill}"; color="#c3cad3"; fontcolor="#3d444d";`,
    );
    emit(child, depth + 1);
    lines.push(`${pad}}`);
  }
})(declarations[0], 1);

for (const from of declarations) {
  for (const to of from.references) {
    const crosses = from.scope !== to.scope;
    lines.push(
      `  "${from.name}" -> "${to.name}"${crosses ? ' [color="#c2410c", penwidth=1.8]' : ""};`,
    );
  }
}
lines.push("}");

const viz = await instance();
fs.writeFileSync(IMAGE, viz.renderString(lines.join("\n"), { format: "svg" }));
