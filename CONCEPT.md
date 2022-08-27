# Concept

This project will create a JavaScript DOM-merging algoritm that, given two nodes, `oldNode` and `newNode`, will merge information from `newNode` and its children into `oldNode` and it's children in a way that tries to minimize the number of nodes disconnected from the DOM.

The reason we want to minimize node disconnection (either moves or replacements) is that browsers do not keep state well when nodes are moved or replaced in the DOM: focus is lost, video elements stop playing etc.  A good merge algorithm should update the DOM to match `newNode` with as few disconnects as possible.

## Existing Solutions

There are two major existing solutions to this problem:

* Morphdom - https://github.com/patrick-steele-idem/morphdom
    * The original solution to this problem, heavily used by other libraries
* Nanomorph
    * A simplified version of Morphdom, a bit easier to understand

## Overview Of Current Algorithms

The fundamental DOM merging algorithm is difficult to innovate on because, in general, we want to minimize the number of moves in the DOM.  This means we can't use a more general tree merge algorithm: rather than trying to find a best match, we need to match the new structure up with the old structure as much as is possible.

The basic, high-level algorithm is as follows:

```
  if the new node matches the old node
    merge the new node attributes onto the old node
  otherwise
    replace the old node with the new node
  for each child of the new node
    find the best match in the children of the old nodes and merge
 ```

The merging of children is the trickiest aspect of this algorithm and is easiest to see in the nanomorph algorithm:

https://github.com/choojs/nanomorph/blob/b8088d03b1113bddabff8aa0e44bd8db88d023c7/index.js#L77

Both nanomorph and morphdom attempt to minimize the runtime of their algorithms, which leads to some fast, but difficult to understand code.

In the nanomorph code you can see a few different cases being handled.  An important concept in the notion of "sameness", which nanomorph uses to determine if a new node can be merged into an existing older node.  Here is the javascript for this function:

```js
function same (a, b) {
  if (a.id) return a.id === b.id
  if (a.isSameNode) return a.isSameNode(b)
  if (a.tagName !== b.tagName) return false
  if (a.type === TEXT_NODE) return a.nodeValue === b.nodeValue
  return false
}
```

Note that this is mostly a test of id equivalence between elements.

This notion of sameness is used heavily in the `updateChildren`, and is an area where idiomorph will innovate.

One last element of the nanomorph algorithm to note is that, if an element _doesn't_ have an ID and a potential match _doesn't_ have an id, the algorithm will attempt to merge or replace the current node:

https://github.com/choojs/nanomorph/blob/b8088d03b1113bddabff8aa0e44bd8db88d023c7/index.js#L141

This is another area where we believe idiomorph can improve on the existing behavior.

### Improvements

The first area where we feel that we may be able to improve on the existing algorigthms is in the notion of "sameness".  Currently, sameness is tied very closely to to elements having the same ID.  However, it is very common for ids to be sparse in a given HTML tree, only inluded on major elements.

In order to further improve the notion of sameness, we propose the following idea:

```
For each element in the new content
  compute the set of all ids contained within that element
```

This can be implemented as an efficient bottom-up algorithm:

```
For all elements with an id in new content
  Add the current elements id to its id set
  For each parent of the current element up to the root new content node
    Add the current elements id to the parents id set
```

With the correct coding, this should give us a map of elements to the id sets associated with those elements.

Using this map of sets, we can now adopt a broader sense of "sameness" between nodes:  two nodes are the same if they have a non-empty intersection of id sets.  This allows children nodes to contribute to the sense of the sameness of a node without requiring a depth-first exploration of children while merging nodes.

Furthermore, we can efficiently ask "does this node match any other nodes" efficiently:

Given a old node N, we can ask if it might match _any_ child of a parent node P by computing the intersection of the id sets for N and P.  If this is non-empty, then there is likely a match for N somewhere in P.  This is because P's id set is a superset of all its childrens id sets.

Given these two enhancements:

* The ability to ask if two nodes are the same based on child information efficiently
* The abilit to ask if a node has a match within an element efficiently

We believe we can improve on the fidelity of DOM matching when compared with plain ID-based matching.

## Pseudocode

Below is a rough sketch of the algorithm:

```

Let oldNode be the existing DOM node
Let newNode be the new DOM to be merged in place of oldNode

Sync the attributes of newNode onto oldNode

Let insertionPoint be the first child of the oldNode
while newNode has children
  let newChild be the result of shifting the first child from newNodes children
  if the newChild is the same as the insertionPoint
    recursively merge newChild into insertionPoint
    advance the insertionPoint to its next sibling
  else if the newChild has a match within the oldNode
    scan the insertionPoint forward to the match, discarding children of the old node
    recursively merge newChild into insertionPoint
    advance the insertionPoint to its next sibling    
  else if the insertionPoint has a match within the newNode
    insert the newChild before the insertionPoint
  else if the insertionPoint and the newChild are compatible
    recursively merge newChild into insertionPoint
    advance the insertionPoint to its next sibling
  else
    insert the newChild before the insertionPoint
end

while insertionPoint is not null
  remove the insertion point and advance to the next sibling

```