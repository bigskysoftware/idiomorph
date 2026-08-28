# Idiomorph Architecture

Idiomorph ships as a single script with no build-time module system, so its internal
structure is expressed with closures: one top-level closure holds the library, and each
major concern is a nested IIFE that returns only the handful of names its callers need.
Everything else stays private to that closure.

The point of the arrangement is coupling. A function can only reach what its own closure
declares, plus whatever the closures above it chose to export, so moving a function into a
closure is how we say "nothing outside here needs this". The diagram below is generated
from the source so that claim stays honest.

## The dependency graph

Every declaration in `src/idiomorph.js` is a node, and an arrow means the source
references the target. Boxes are closures, nested exactly as they nest in the file, and
nodes drawn outside every box live in the top-level `Idiomorph` closure.

Grey arrows stay inside one closure. **Orange arrows cross a closure boundary**, and
those are the ones to look at. Each is a name a closure had to expose, or a reach
upward into an outer scope, and each is a place where the modularity is doing less work
than it looks like it is.

<!-- begin generated graph -->

```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#1f2328","primaryBorderColor":"#8c959f","lineColor":"#7c8794","fontSize":"14px"}}}%%
flowchart LR
  subgraph card[" "]
    direction LR
    noOp("noOp")
    defaults("defaults")
    morph("morph")
    morphOuterHTML("morphOuterHTML")
    saveAndRestoreFocus("saveAndRestoreFocus")
    withHeadBlocking("withHeadBlocking")
    handleHeadElement("handleHeadElement")
    subgraph c1["morphChildren"]
      morphChildren("morphChildren")
      createNode("createNode")
      removeNode("removeNode")
      removeNodesBetween("removeNodesBetween")
      moveBeforeById("moveBeforeById")
      removeElementFromAncestorsIdMaps("removeElementFromAncestorsIdMaps")
      moveBefore("moveBefore")
      subgraph c2["findBestMatch"]
        findBestMatch("findBestMatch")
        isIdSetMatch("isIdSetMatch")
        isSoftMatch("isSoftMatch")
      end
    end
    subgraph c3["morphNode"]
      morphNode("morphNode")
      morphAttributes("morphAttributes")
      syncInputValue("syncInputValue")
      syncBooleanAttribute("syncBooleanAttribute")
      ignoreAttribute("ignoreAttribute")
      ignoreValueOfActiveElement("ignoreValueOfActiveElement")
    end
    subgraph c4["createMorphContext"]
      createMorphContext("createMorphContext")
      mergeDefaults("mergeDefaults")
      createPantry("createPantry")
      createActiveElementAndParents("createActiveElementAndParents")
      findIdElements("findIdElements")
      populateIdMapWithTree("populateIdMapWithTree")
      createIdMaps("createIdMaps")
      createPersistentIds("createPersistentIds")
    end
    subgraph c5["normalizeElement · normalizeParent"]
      generatedByIdiomorph("generatedByIdiomorph")
      normalizeElement("normalizeElement")
      normalizeParent("normalizeParent")
      SlicedParentNode("SlicedParentNode")
      parseContent("parseContent")
    end
  end
  defaults --> noOp
  morph --> normalizeElement
  morph --> normalizeParent
  morph --> createMorphContext
  morph --> withHeadBlocking
  morph --> saveAndRestoreFocus
  morph --> morphChildren
  morph --> morphOuterHTML
  morphOuterHTML --> normalizeParent
  morphOuterHTML --> morphChildren
  morphChildren --> findBestMatch
  morphChildren --> removeNodesBetween
  morphChildren --> morphNode
  morphChildren --> moveBeforeById
  morphChildren --> createNode
  morphChildren --> removeNode
  createNode --> morphNode
  findBestMatch --> isSoftMatch
  findBestMatch --> isIdSetMatch
  removeNode --> moveBefore
  removeNodesBetween --> removeNode
  moveBeforeById --> removeElementFromAncestorsIdMaps
  moveBeforeById --> moveBefore
  morphNode --> handleHeadElement
  morphNode --> morphAttributes
  morphNode --> ignoreValueOfActiveElement
  morphNode --> morphChildren
  morphAttributes --> ignoreAttribute
  morphAttributes --> ignoreValueOfActiveElement
  morphAttributes --> syncInputValue
  syncInputValue --> syncBooleanAttribute
  syncInputValue --> ignoreAttribute
  syncBooleanAttribute --> ignoreAttribute
  withHeadBlocking --> handleHeadElement
  createMorphContext --> createIdMaps
  createMorphContext --> mergeDefaults
  createMorphContext --> createPantry
  createMorphContext --> createActiveElementAndParents
  mergeDefaults --> defaults
  createIdMaps --> findIdElements
  createIdMaps --> createPersistentIds
  createIdMaps --> populateIdMapWithTree
  normalizeParent --> parseContent
  normalizeParent --> generatedByIdiomorph
  normalizeParent --> SlicedParentNode
  parseContent --> generatedByIdiomorph
  style c1 fill:#eaf0fa,stroke:#c3cad3,color:#3d444d
  style c2 fill:#e9f4ec,stroke:#c3cad3,color:#3d444d
  style c3 fill:#fbf0e2,stroke:#c3cad3,color:#3d444d
  style c4 fill:#f2ecf8,stroke:#c3cad3,color:#3d444d
  style c5 fill:#fbecec,stroke:#c3cad3,color:#3d444d
  style card fill:#ffffff,stroke:#ffffff
  linkStyle default stroke:#7c8794,stroke-width:1.5px
  linkStyle 1,2,3,6,8,9,10,12,16,23,26,38 stroke:#c2410c,stroke-width:2px
```

<!-- end generated graph -->

Two things the graph is expected to show. `morphChildren` and `morphNode` point at each
other: that mutual recursion is the tree walk itself, and it is why they are siblings
rather than one nested inside the other. And `morphNode` reaches up to `handleHeadElement`
in the top-level closure, which is the `<head>` merge cutting across the ordinary
node-by-node descent.

## Regenerating

```
npm run architecture
```

This rewrites the block between the generated-graph markers above, in place. It also runs
as part of `npm run dist`, so a released build never ships a stale picture. The generator
lives in `scripts/architecture.js` and reads the source with the TypeScript parser that
`npm run typecheck` already depends on, so it adds no dependencies of its own.
