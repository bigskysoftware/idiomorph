# Overview
This PR is a proposal for the future of Idiomorph. Michael and I have done our best to make this superior to v0.4.0 in every way. While there are further improvements that could be made, we think this is a solid stake in the ground to be merged into main, and perhaps released as v0.5.0.

## Behavior Changes
* New `restoreFocus` option
* Removed `twoPass` option
* Removed `beforeNodePantried` hook
* Many edge cases caught, tested, and fixed
* Hooks are called correctly in all cases

## Refactorings
* Reorganized and modularized internal architecture
* Simplified core algorithm
* OuterHTML morph uses the same algorithm as innerHTML morph
* Less internal state
* Renamed functions and tweaked signatures for more consistency
* 100% test coverage!

## Future Work
* Retain focus and selection natively in more cases, rather than restoring
* Performance improvements
* Investigate how Idiomorph works (or does not) with Shadow DOM, Iframes, and other likely troublesome cases

# Details
## Behavior Changes
### New `restoreFocus` boolean option
Until `moveBefore` becomes available, maintaining focus and selection state in all cases is impossible. In the meantime, we can paper over this by saving and restoring focus and selection states around the morph, at the cost of potential extra blur, focus, and selection events. This option is off by default, but as more cases are handled natively without extra events, we can imagine it being on by default.

### Removed `twoPass` option
There is only one core algorithm now.

### Removed `beforeNodePantried` hook
This was an unfortunate abstraction-leaking necessity of the specific implementation of the v0.4.0 two-pass algorithm. If you were doing interesting things with any of the other hooks, e.g. data-turbo-permanent, you'd often need to prevent the pantrying process from flattening the node trees that entered it, and thus you'd need to know how the internals of the pantrying process worked, and that there was a pantrying process at all, for that matter. This PR removes the hook, and the need for it, and now Idiomorph is back to being a magic black box.

### Many edge cases caught, tested, and fixed
We've been working on this for a while, and we've been very thorough, particularly Michael. We've fixed many edge cases, capturing them in tests first. We're confident that this is a solid foundation for the future.

### Hooks are called correctly in all cases
Hooks are called in the order one would expect, and with the arguments one would expect. Two-pass mode resulted in minor changes to both in v0.4.0. This PR results in hook behavior that is more correct than both v0.3.0 and v0.4.0.

## Refactorings
### Reorganized and modularized internal architecture
In v0.4.0, all the functions were in one IIFE, free to call each other, and the call graph looked like a plate of spaghetti, with many cyclical relationships. We've untangled and extracted four indepedent sub-IIFEs from the main one, and now it looks a bit more like a lasagna. A DAG lasagna :)

### Simplified core algorithm
Speaking of lasagna, this is the tasty meat. By removing the two-pass mode, and further leveraging the persistentId knowledge, we've been able to significantly simplify the core algorithm. Here's the gist of it, copied from the `morphChildren` function:

- for each node in the new content:
  - if there could be a match among self and upcoming siblings
    - search self and siblings for an id set match, falling back to a soft match
    - if match found
      - remove any nodes inbetween (pantrying any persistent nodes)
      - morph it and move on
  - if no match found, and node is persistent
    - move it and all its children here (looking in pantry too)
    - morph it and move on
  - create a new node from scratch as a last result

We've also been able to simplify and improve findIdSetMatch and findSoftMatch as well. Since persisted nodes are no longer lost when they're removed, there's no longer any need for a bail-early heuristic. This means we can always find and morph the best match.

Finally, there's just a lot less code! Less functions, less branches, less lines, less complexity.

### OuterHTML morph uses the same algorithm as innerHTML morph
This was a big win. Until now, the outerHTML morph used a complex bespoke algorithm that was entirely separate from the core morphChildren loop. This meant it wasn't nearly as well-tested, and both algorithms had peculiar and subtle strengths and weaknesses. Now, they've been merged together into one smaller general algorithm, which has the best qualities of both.

### Less internal state
Michael found that the idSet code can be greatly simplified, now that we have persistentIds. We no longer need to track deadIds, for example, so that's gone. Also, we were able to to make the idMap smaller by only including ids that are persistent. There are likely further wins here, in the future.

### Renamed functions and tweaked signatures for more consistency
We've standardized on "old" vs "new", and always in that order, as opposed to "from" or "to" or "current" etc. There's a bit more to do here, perhaps always passing `ctx` first, C-style.

### 100% test coverage!
Title says it all. We're feeling really good about the tests suite's ability to tell us when something regresses.

## Future Work
### Retain focus and selection natively in more cases, rather than restoring
This is likely the last major endeavour before we might consider Idiomorph to be more-or-less complete i.e. v1.0.0. Michael and I both have several promising ideas, but I want to get this PR merged before we dive into that. In the meantime, the `restoreFocus` option is a good stop-gap improvement.

### Performance improvements
According to `npm run perf` on my machine, this branch is ~0%-5% slower than v0.4.0, and ~10%-20% slower than v0.3.0. To me, this sees like an acceptable trade of minor performance loss for major correctness gains. That said, I'd like to spend some time with my perf hat on to see if we can't make it any faster.

### Investigate how Idiomorph works (or does not) with Shadow DOM, Iframes, and other likely troublesome cases
Known unknowns. I'd like to at least be aware of the status quo before making any plans for v1.0.0.

