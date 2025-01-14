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
In v0.4.0, all the functions were in one IIFE, free to call each other. The call graph looked like a plate of spaghetti with many cycles. We've extracted four indepedent sub-IFFE from the main one, and now it looks a bit more like lasagna. :)

### Simplified core algorithm
This is the tasty meat of the PR. By removing the two-pass mode, and further leveraging the persistentId knowlegde, we've been able to greatly simplify the core algorithm. Here's the gist of it, copied from the `morphChildren` function:

- for each node in the new content:
 - if there could be a match among self and upcoming siblings
   - search self and siblings for an id set match, falling back to a soft match
   - if found
     - remove any nodes inbetween (pantrying any persistent nodes)
     - morph it and move on
 - if no match and node is persistent
   - move it and all its children here (looking in pantry too)
   - morph it and move on
 - create a new node from scratch as a last result

We've also been able to simplify and improve findIdSetMatch and findSoftMatch as well, by no longer bailing early, since persisted nodes are no longer lost when they're removed. This means we can always find and morph the best match.

### OuterHTML morph uses the same algorithm as innerHTML morph
This was a big win. Until now, the outerHTML morph used a complex bespoke algorithm that was entirely separate from the core morphChildren loop. This meant it wasn't nearly as well-tested, and both algorithms had peculiar and subtle strengths and weaknesses. Now, they've been merged together into one smaller general algorithm, which has the best qualities of both.

### Less internal state
Michael found that the idSet code can be greatly simplified, now that we have persistentIds. We no longer need to track deadIds, for example, so that's gone. We also we able to to make the idMap smaller by only including ids that are persistent. There are likely even further wins here, in the future.

### Renamed functions and tweaked signatures for more consistency
We've standardized on "old" vs "new", and always in that order, as opposed to "from" or "to" or "current" etc. There's a bit more to do here, perhaps with always passing `ctx` first, C-style.

### 100% test coverage!
Title says it all. We're feeling really good about the tests suite's ability to tell us when something regresses.

## Future Work
### Retain focus and selection natively in more cases, rather than restoring
This is the last major remaining endeavour before we could consider Idiomorph to be more-or-less complete solution. Michael and I both have several promising ideas, but I want to get this PR merged and released before we dive into that. In the meantime, the `restoreFocus` option is a good stopgap.
### Investigate how Idiomorph works (or does not) with Shadow DOM, Iframes, and other likely troublesome cases
Known unknowns. I'd like to at least be aware of the status quo before making any plans for v1.0.