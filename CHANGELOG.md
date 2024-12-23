# Changelog

## [0.4.0] - 2024-12-23

* Introduced a [two pass](README.md#two-pass-mode) mode that will make a second pass over the DOM rewiring elements
  that were removed but have stable IDs back into the DOM
  * Uses the new `moveBefore()` API if it is available
* Firmed up the implementation of softMatching to not soft match when elements have conflicting ids, which should allow
  developers to avoid accidentally sliding behavior between noded
* Fixed up the `package.json` file to properly show the esm file as the module
* Main contributors to this release were @botandrose & @3AMichaelWest22, thank you!

Sorry, I didn't keep track of earlier changes!

