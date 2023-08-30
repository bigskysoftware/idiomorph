import terser from "@rollup/plugin-terser";
import gzipPlugin from 'rollup-plugin-gzip';

export default [
  {
    input: "src/idiomorph.js",
    output: [
      {
        name: "Idiomorph",
        file: "dist/idiomorph.js",
        format: "umd"
      },
      {
        file: "dist/idiomorph-esm.js",
        format: "es"
      },
      {
        name: "Idiomorph",
        file: "dist/idiomorph.min.js",
        format: "umd",
        plugins: [ terser() ]
      },
      {
        file: "dist/idiomorph-esm.min.js",
        format: "es",
        plugins: [ terser() ]
      },
      {
        name: "Idiomorph",
        file: "dist/idiomorph.min.js",
        format: "umd",
        plugins: [ terser(), gzipPlugin() ]
      },
    ],
    watch: {
      include: "src/**"
    }
  },
  {
    input: "src/idiomorph-htmx.js",
    output: [
      {
        name: "Idiomorph",
        file: "dist/idiomorph-htmx.js",
        format: "umd"
      },
    ]
  }
]
