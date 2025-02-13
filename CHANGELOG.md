# Changelog

## [0.5.0] - 2025-02-13

* Removed:
  * Remove `twoPass` option. There is only one single morphing algorithm now, which is more correct than both previous versions. (@botandrose, @MichaelWest22)
  * Remove `beforeNodePantried` callback option. This addition in v0.4.0 was an unfortunate necessity of the old `twoPass` mode, but is no longer needed with the new algorithm. (@botandrose)

* Added:
  * New `restoreFocus` option. On older browsers, moving the focused element (or one of its parents) can result in loss of focus and selection state. This option will restore this state for IDed elements, at the cost of firing extra `focus` and `selection` events. (@botandrose)

* Fixed:
  * Boolean attributes are now correctly set to `""` instead of `"true"`. https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML (@MichaelWest22)

## [0.4.0] - 2024-12-23

* Introduced a [two pass](README.md#two-pass-mode) mode that will make a second pass over the DOM rewiring elements
  that were removed but have stable IDs back into the DOM
  * Uses the new `moveBefore()` API if it is available
* Firmed up the implementation of softMatching to not soft match when elements have conflicting ids, which should allow
  developers to avoid accidentally sliding behavior between noded
* Fixed up the `package.json` file to properly show the esm file as the module
* Main contributors to this release were @botandrose & @MichaelWest22, thank you!

Sorry, I didn't keep track of earlier changes!

