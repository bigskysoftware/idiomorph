# Idiomorph Performance Benchmarks

## Overview
We have performance benchmarks to compare the performance of the current state of `src/idiomorph.js` with morphdom and previous Idiomorph releases. These benchmarks and support files are located in the `perf` directory, are not included in the coverage report, and are not run in CI. Instead they are run manually during development to ensure that performance is not regressing.

## Running
To run the benchmarks, use:

```bash
npm run perf [versus=morphdom] [benchmarks...]
```

### Arguments
* The optional `versus` argument can be used to compare with morphdom (the default), or previous Idiomorph releases specified by the git release tag, e.g. `v0.3.0`.
* The optional `benchmarks` argument can be used to run specific benchmarks, defaulting to all of them.

Examples:
Running only the `table` and `checkboxes` benchmarks against morphdom:
```bash
npm run perf table checkboxes
```

Running all benchmarks against Idiomorph v0.3.0:
```bash
npm run perf v0.3.0
```

Running just the `html5` benchmark against Idiomorph v0.4.0:
```bash
npm run perf v0.4.0 html5
```

## Adding Benchmarks
You can add more benchmarks by creating new `benchmark-name.old.html` and `benchmark-name.new.html` files in the `perf/benchmarks` directory, containing the starting and final morph HTML respectively.

