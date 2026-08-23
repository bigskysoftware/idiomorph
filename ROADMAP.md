# Idiomorph Roadmap

## Overview
This document outlines the development roadmap for Idiomorph. It provides a high-level view of the project's goals, milestones, and planned features. Anything with a question mark is a potential feature that may or may not be implemented.

## Goals (in descending order of priority)
- Correct production of expected HTML
- Preservation of non-HTML state
- Performance

## Milestones

### 0.9.0
- [x] Move idiomorph/htmx.js out of tree into an htmx extension https://github.com/bigskysoftware/idiomorph/issues/111
- [ ] Settle input value semantics, and the subtree-skipping speedup they unblock https://github.com/bigskysoftware/idiomorph/issues/144
- [ ] Improve anonymous node matching, perhaps using Merkle trees, or fuzzy synthetic ids? https://github.com/bigskysoftware/idiomorph/issues/143
- [ ] Plugin system? https://github.com/bigskysoftware/idiomorph/issues/109
- [ ] Narrow support for `newContent` types? https://github.com/bigskysoftware/idiomorph/issues/103
- [ ] Restore or preserve scroll state? https://github.com/bigskysoftware/idiomorph/issues/26
- [ ] Natively preserve focus, selection, scroll state by morphing around currently focused element? https://github.com/bigskysoftware/idiomorph/pull/85

### when `Element#moveBefore` is widely available, just waiting for Safari 26.6 or 27.0
- [ ] Remove all pre-`moveBefore` workarounds
