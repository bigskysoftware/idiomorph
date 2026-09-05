# Changelog

## Unreleased

## [0.8.0] - 2026-09-05

* Removed:
  * Remove AMD publish target since its EOL: https://github.com/requirejs/requirejs/issues/1816#issuecomment-707503323
  * Remove CommonJS publish target. `require("idiomorph")` no longer resolves; use `import "idiomorph"` instead. (@botandrose) #122
  * Remove the undocumented `head.ignore` option in favour of `head: {style: 'none'}`, which the README has always documented (@botandrose)

* Changed:
  * `morph()` now accepts any `Node` as its first argument, rather than only an `Element` or `Document`. Passing a node that cannot have children with `morphStyle: 'innerHTML'` now throws instead of failing obscurely (@botandrose, @lizarusi) #155
  * The package is now declared ESM via `"type": "module"`, so `import "idiomorph"` resolves without relying on Node's module syntax detection (@myabc)

* Added:
  * Publish TypeScript declarations, generated from the JSDoc types already in the source (@myabc) #152
  * Warn in the console when duplicate ids are detected during a morph, since they can cause subtle state loss (@botandrose) #142
  * New off-by-default `skipUnchanged` option that skips morphing subtrees whose old and new content are already identical, for large speedups on mostly-unchanged pages (@myabc) #144

* Fixed:
  * Fix TypeError when restoring focus to an element that doesn't support text selection (@emaia) #150
  * Skip the `beforeAttributeUpdated` callback when an attribute's value is unchanged (@monorkin) #149
  * Preserve the namespace of recreated elements, so SVG and MathML content containing persistent ids is no longer rebuilt as HTML (@guoliu, @botandrose) #154
  * Morph namespaced attributes such as `xlink:href`, and attribute names that `setAttribute` rejects such as Alpine's `@click` or Vue's `:class`, which previously lost their namespace or threw an `InvalidCharacterError` (@botandrose) #147
  * Fix TypeError when morphing a text or comment node via `outerHTML` (@lizarusi) #155
  * Fix focus restoration never running when `head: { block: true }` defers the morph (@botandrose)
  * Fix `head: {style: 'none'}`, which had silently behaved as `merge` (@botandrose)
  * Throw on an unrecognized `head.style`, rather than silently falling back to `merge` (@botandrose)
  * Support morphing nodes from other documents, e.g. an iframe's `contentDocument`, which previously threw a TypeError (@lizarusi, @myabc) #156
  * Fix morphing another document produces a tree of mixed-realm nodes (@botandrose)
  * Fix morphing another document loses the element's state (@botandrose)
  * Fix `ignoreActive` and `ignoreActiveValue` while morphing another document (@botandrose)
  * Fix pantry morph confusion while morphing another document (@botandrose)
  * Escape ids before using them in attribute selectors, so ids containing CSS-special characters no longer break matching (@botandrose)
  * Ignore empty ids when computing the persistent id set (@botandrose)
  * Strip the doctype when parsing new content, so morphing a full document no longer throws (@botandrose)
  * Read `id` and `tagName` off the element itself, so form controls containing fields named `id` or `tagName` cannot shadow them (@botandrose)
  * Read each id once when building the id set, instead of twice downstream, for a small perf win (@botandrose)

## [0.7.4] - 2025-09-29

* Fixed:
  * Optimize focus preservation checking for big perf win (@botandrose) #137
  * Fix incorrect morph when elements contain attributes like name="id" (@botandrose, @kobutri) #136

## [0.7.3] - 2025-03-05

* Fixed:
  * Fix error when morphing elements with numeric ids (@botandrose, @ksbrooksjr)
  * Fix issue with outerHTML morphing an IDed node that gets moved (@botandrose, @MichaelWest22)
  * Fix incorrect return value when root element gets moved or replaced in an outerHTML morph (@botandrose, @MichaelWest22)

## [0.7.2] - 2025-02-20

* Fixed:
  * Restore direct imports and add named export for ESM htmx extension (@botandrose, @MichaelWest22)
  * Update license key in package.json to match LICENSE. (@MichaelWest22)
  * Prevent unnecesary selection restoration when it wasn't actually lost (@MichaelWest22)
  * Prevent focus & selection loss in more situations (@MichaelWest22)

## [0.7.1] - 2025-02-13

* Removed:
  * Remove `twoPass` option. There is only one single morphing algorithm now, which is more correct than both previous versions. (@botandrose, @MichaelWest22)
  * Remove `beforeNodePantried` callback option. This addition in v0.4.0 was an unfortunate necessity of the old `twoPass` mode, but is no longer needed with the new algorithm. (@botandrose)

* Added:
  * New on-by-default `restoreFocus` option. On older browsers, moving the focused element (or one of its parents) can result in loss of focus and selection state. This option restores this state for IDed elements, at the cost of firing extra `focus` and `selection` events. (@botandrose)

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

