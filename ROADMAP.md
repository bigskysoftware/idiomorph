# Idiomorph Roadmap

## Overview
This document outlines the development roadmap for Idiomorph. It provides a high-level view of the project's goals, milestones, and planned features.

## Goals (in descending order of priority)
- Correct production of expected HTML
- Preservation of non-HTML state
- Performance

## Milestones

### 0.8.0
- [ ] Plugin system?
- [ ] Remove AMD dist target?
- [ ] Narrow support for `newContent` types?
- [ ] Restore or preserve scroll state?
- [ ] Improve anonymous node matching, perhaps using Merkle trees, or fuzzy synthetic ids?
- [ ] Natively preserve focus, selection, scroll state by morphing around currently focused element
- [ ] Can we improve the iframe morphing situation without `moveBefore`?

### 1.0.0
- [ ] Performance improvements

### 2.0.0 (when `Element#moveBefore` is widely available)
- [ ] Remove all pre-`moveBefore` workarounds

