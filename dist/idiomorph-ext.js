//=============================================================================
// AMD insanity... i hate javascript so much
//
// IGNORE EVERYTHING FROM HERE UNTIL THE COMMENT SAYING 'AND NOW IT BEGINS..."
//=============================================================================
(function (root, factory) {
    //@ts-ignore
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        //@ts-ignore
        define([], factory);
    } else {
        // Browser globals
        root.Idiomorph = root.Idiomorph || factory();
    }
}(typeof self !== 'undefined' ? self : this,
    function () {
        return (function () {
            'use strict';

            //=============================================================================
            // AND NOW IT BEGINS...
            //=============================================================================
            let EMPTY_SET = new Set();

            //=============================================================================
            // Core Morphing Algorithm - morph, morphOldNodeTo, morphChildren
            //=============================================================================

            function morph(oldNode, newContent, config = {}) {

                if (typeof newContent === 'string') {
                    newContent = parseContent(newContent);
                }

                let normalizedContent = normalizeContent(newContent);

                let ctx = createMorphContext(oldNode, normalizedContent, config);

                if (config.morphStyle === "innerHTML") {

                    // innerHTML, so we are only updating the children
                    morphChildren(normalizedContent, oldNode, ctx);
                    return oldNode.children;

                } else if(config.morphStyle === "outerHTML" || config.morphStyle == null) {
                    // otherwise find the best element match in the new content, morph that, and merge its siblings
                    // into either side of the best match
                    let bestMatch = findBestNodeMatch(normalizedContent, oldNode, ctx);

                    // stash the siblings that will need to be inserted on either side of the best match
                    let previousSibling = bestMatch?.previousSibling;
                    let nextSibling = bestMatch?.nextSibling;

                    // morph it
                    let morphedNode = morphOldNodeTo(oldNode, bestMatch, ctx);

                    if (bestMatch) {
                        // if there was a best match, merge the siblings in too and return the
                        // whole bunch
                        return insertSiblings(previousSibling, morphedNode, nextSibling);
                    } else {
                        // otherwise nothing was added to the DOM
                        return []
                    }
                } else {
                    throw "Do not understand how to morph style " + config.morphStyle;
                }
            }

            /**
             * @param oldNode root node to merge content into
             * @param newContent new content to merge
             * @param ctx the merge context
             * @returns {Element} the element that ended up in the DOM
             */
            function morphOldNodeTo(oldNode, newContent, ctx) {
                if (newContent == null) {
                    ctx.callbacks.beforeNodeRemoved(oldNode);
                    oldNode.remove()
                    ctx.callbacks.afterNodeRemoved(oldNode);
                    return null;
                } else if (!isSoftMatch(oldNode, newContent)) {
                    ctx.callbacks.beforeNodeRemoved(oldNode);
                    ctx.callbacks.beforeNodeAdded(newContent);
                    oldNode.parentElement.replaceChild(newContent, oldNode);
                    ctx.callbacks.afterNodeAdded(newContent);
                    ctx.callbacks.afterNodeRemoved(oldNode);
                    return newContent;
                } else {
                    ctx.callbacks.beforeNodeMorphed(oldNode, newContent)
                    syncNodeFrom(newContent, oldNode);
                    morphChildren(newContent, oldNode, ctx);
                    ctx.callbacks.afterNodeMorphed(oldNode, newContent)
                    return oldNode;
                }
            }

            /**
             * This is the core algorithm for matching up children.  The idea is to use id sets to try to match up
             * nodes as faithfully as possible.  We greedily match, which allows us to keep the algorithm fast, but
             * by using id sets, we are able to better match up with content deeper in the DOM.
             *
             * Basic algorithm is, for each node in the new content:
             *
             * - if we have reached the end of the old parent, append the new content
             * - if the new content has an id set match with the current insertion point, morph
             * - search for an id set match
             * - if id set match found, morph
             * - otherwise search for a "soft" match
             * - if a soft match is found, morph
             * - otherwise, prepend the new node before the current insertion point
             *
             * The two search algorithms terminate if competing node matches appear to outweigh what can be achieved
             * with the current node.  See findIdSetMatch() and findSoftMatch() for details.
             *
             * @param {Element} newParent the parent element of the new content
             * @param {Element } oldParent the old content that we are merging the new content into
             * @param ctx the merge context
             */
            function morphChildren(newParent, oldParent, ctx) {

                let nextNewChild = newParent.firstChild;
                let insertionPoint = oldParent.firstChild;

                // run through all the new content
                while (nextNewChild) {

                    let newChild = nextNewChild;
                    nextNewChild = newChild.nextSibling;

                    // if we are at the end of the exiting parent's children, just append
                    if (insertionPoint == null) {

                        ctx.callbacks.beforeNodeAdded(newChild);
                        oldParent.appendChild(newChild);
                        ctx.callbacks.afterNodeAdded(newChild);

                        // if the current node has an id set match then morph
                    } else if (isIdSetMatch(newChild, insertionPoint, ctx)) {

                        morphOldNodeTo(insertionPoint, newChild, ctx);
                        insertionPoint = insertionPoint.nextSibling;

                    } else {

                        // otherwise search forward in the existing old children for an id set match
                        let idSetMatch = findIdSetMatch(newParent, oldParent, newChild, insertionPoint, ctx);

                        // if we found a potential match, remove the nodes until that point and morph
                        if (idSetMatch) {

                            insertionPoint = removeNodesBetween(insertionPoint, idSetMatch, ctx);
                            morphOldNodeTo(idSetMatch, newChild, ctx);

                        } else {

                            // no id set match found, so scan forward for a soft match for the current node
                            let softMatch = findSoftMatch(newParent, oldParent, newChild, insertionPoint, ctx);

                            // if we found a soft match for the current node, morph
                            if (softMatch) {

                                insertionPoint = removeNodesBetween(insertionPoint, softMatch, ctx);
                                morphOldNodeTo(insertionPoint, newChild, ctx);

                            } else {

                                // abandon all hope of morphing, just insert the new child before the insertion point
                                // and move on
                                ctx.callbacks.beforeNodeAdded(newChild);
                                oldParent.insertBefore(newChild, insertionPoint);
                                ctx.callbacks.afterNodeAdded(newChild);

                            }
                        }
                    }

                    // remove the processed new contents ids from consideration in future merge decisions
                    removeIdsFromConsideration(ctx, newChild);
                }

                // remove any remaining old nodes that didn't match up with new content
                while (insertionPoint !== null) {

                    let tempNode = insertionPoint;
                    insertionPoint = insertionPoint.nextSibling;
                    removeNode(tempNode, ctx);
                }
            }

            //=============================================================================
            // Attribute Syncing Code
            //=============================================================================

            /**
             * syncs a given node with another node, copying over all attributes and
             * inner element state from the 'from' node to the 'to' node
             *
             * @param {Element} from the element to copy attributes & state from
             * @param {Element} to the element to copy attributes & state to
             */
            function syncNodeFrom(from, to) {
                let type = from.nodeType

                // if is an element type, sync the attributes from the
                // new node into the new node
                if (type === 1 /* element type */) {
                    const fromAttributes = from.attributes;
                    const toAttributes = to.attributes;
                    for (const fromAttribute of fromAttributes) {
                        if (to.getAttribute(fromAttribute.name) !== fromAttribute.value) {
                            to.setAttribute(fromAttribute.name, fromAttribute.value);
                        }
                    }
                    for (const toAttribute of toAttributes) {
                        if (!from.hasAttribute(toAttribute.name)) {
                            to.removeAttribute(toAttribute.name);
                        }
                    }
                }

                // sync text nodes
                if (type === 8 /* comment */ || type === 3 /* text */) {
                    if (to.nodeValue !== from.nodeValue) {
                        to.nodeValue = from.nodeValue;
                    }
                }

                // NB: many bothans died to bring us information:
                //
                // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
                // https://github.com/choojs/nanomorph/blob/master/lib/morph.jsL113

                // sync input value
                if (from instanceof HTMLInputElement &&
                    to instanceof HTMLInputElement &&
                    from.type !== 'file') {

                    let fromValue = from.value;
                    let toValue = to.value;

                    // sync boolean attributes
                    syncBooleanAttribute(from, to, 'checked');
                    syncBooleanAttribute(from, to, 'disabled');

                    if (!from.hasAttribute('value')) {
                        to.value = '';
                        to.removeAttribute('value');
                    } else if (fromValue !== toValue) {
                        to.setAttribute('value', fromValue);
                        to.value = fromValue;
                    }
                } else if (from instanceof HTMLOptionElement) {
                    syncBooleanAttribute(from, to, 'selected')
                } else if (from instanceof HTMLTextAreaElement && to instanceof HTMLTextAreaElement) {
                    let fromValue = from.value;
                    let toValue = to.value;
                    if (fromValue !== toValue) {
                        to.value = fromValue;
                    }
                    if (to.firstChild && to.firstChild.nodeValue !== fromValue) {
                        to.firstChild.nodeValue = fromValue
                    }
                }
            }

            function syncBooleanAttribute(from, to, attributeName) {
                if (from[attributeName] !== to[attributeName]) {
                    to[attributeName] = from[attributeName];
                    if (from[attributeName]) {
                        to.setAttribute(attributeName, '');
                    } else {
                        to.removeAttribute(attributeName);
                    }
                }
            }

            //=============================================================================
            // Misc
            //=============================================================================

            function noOp() {}

            function createMorphContext(oldNode, newContent, config) {
                return {
                    idMap: createIdMap(oldNode, newContent),
                    deadIds: new Set(),
                    callbacks: Object.assign({
                        beforeNodeAdded: noOp,
                        afterNodeAdded : noOp,
                        beforeNodeMorphed: noOp,
                        afterNodeMorphed : noOp,
                        beforeNodeRemoved: noOp,
                        afterNodeRemoved : noOp,
                    }, config.callbacks),
                }
            }

            function isIdSetMatch(node1, node2, ctx) {
                if (node1 == null || node2 == null) {
                    return false;
                }
                if (node1.nodeType === node2.nodeType && node1.tagName === node2.tagName) {
                    if (node1.id !== "" && node1.id === node2.id) {
                        return true;
                    } else {
                        return getIdIntersectionCount(ctx, node1, node2) > 0;
                    }
                }
                return false;
            }

            function isSoftMatch(node1, node2) {
                if (node1 == null || node2 == null) {
                    return false;
                }
                return node1.nodeType === node2.nodeType && node1.tagName === node2.tagName
            }

            function removeNodesBetween(startInclusive, endExclusive, ctx) {
                while (startInclusive !== endExclusive) {
                    let tempNode = startInclusive;
                    startInclusive = startInclusive.nextSibling;
                    removeNode(tempNode, ctx);
                }
                removeIdsFromConsideration(ctx, endExclusive);
                return endExclusive.nextSibling;
            }

            //=============================================================================
            // Scans forward from the insertionPoint in the old parent looking for a potential id match
            // for the newChild.  We stop if we find a potential id match for the new child OR
            // if the number of potential id matches we are discarding is greater than the
            // potential id matches for the new child
            //=============================================================================
            function findIdSetMatch(newContent, oldParent, newChild, insertionPoint, ctx) {

                // max id matches we are willing to discard in our search
                let newChildPotentialIdCount = getIdIntersectionCount(ctx, newChild, oldParent);

                let potentialMatch = null;

                // only search forward if there is a possibility of an id match
                if (newChildPotentialIdCount > 0) {
                    let potentialMatch = insertionPoint;
                    // if there is a possibility of an id match, scan forward
                    // keep track of the potential id match count we are discarding (the
                    // newChildPotentialIdCount must be greater than this to make it likely
                    // worth it)
                    let otherMatchCount = 0;
                    while (potentialMatch != null) {
                        // computer the other potential matches of this new content
                        otherMatchCount += getIdIntersectionCount(ctx, potentialMatch, newContent);
                        if (otherMatchCount > newChildPotentialIdCount) {
                            // if we have more potential id matches in _other_ content, we
                            // do not have a good candidate for an id match
                            return null;
                        } else if (isIdSetMatch(newChild, potentialMatch, ctx)) {
                            // If we have an id match, return the current potential match
                            return potentialMatch;
                        } else {
                            // advanced to the next old content child
                            potentialMatch = potentialMatch.nextSibling;
                        }
                    }
                }
                return potentialMatch;
            }

            //=============================================================================
            // Scans forward from the insertionPoint in the old parent looking for a potential soft match
            // for the newChild.  We stop if we find a potential soft match for the new child OR
            // if we find a potential id match in the old parents children OR if we find two
            // potential soft matches for the next two pieces of new content
            //=============================================================================
            function findSoftMatch(newContent, oldParent, newChild, insertionPoint, ctx) {

                let potentialSoftMatch = insertionPoint;
                let nextSibling = newChild.nextSibling;
                let siblingSoftMatchCount = 0;

                while (potentialSoftMatch != null) {
                    if (getIdIntersectionCount(ctx, potentialSoftMatch, newContent) > 0) {
                        // the current potential soft match has a potential id set match with the remaining new
                        // content so bail out of looking
                        return null;
                    } else if (isSoftMatch(newChild, potentialSoftMatch)) {
                        return potentialSoftMatch;
                    } else if (isSoftMatch(nextSibling, potentialSoftMatch)) {
                        // the next new node has a soft match with this node, so
                        // increment
                        siblingSoftMatchCount++;
                        if (siblingSoftMatchCount >= 2) {
                            // with two soft matches, bail to allow the siblings to soft match
                            return null;
                        }
                        nextSibling = nextSibling.nextSibling;
                    } else {
                        // advanced to the next old content child
                        potentialSoftMatch = potentialSoftMatch.nextSibling;
                    }
                }

                return potentialSoftMatch;
            }

            function parseContent(newContent) {
                let parser = new DOMParser();
                let responseDoc = parser.parseFromString("<body><template>" + newContent + "</template></body>", "text/html");
                let content = responseDoc.body.querySelector('template').content;
                content.generatedByIdiomorph = true;
                return content
            }

            function normalizeContent(newContent) {
                if (newContent == null) {
                    const dummyParent = document.createElement('div');
                    return dummyParent;
                } else if (newContent.generatedByIdiomorph) {
                    // the template tag created by idiomorph parsing can serve as a dummy parent
                    return newContent;
                } else if (newContent instanceof Node) {
                    // a single node is added as a child to a dummy parent
                    const dummyParent = document.createElement('div');
                    dummyParent.append(newContent);
                    return dummyParent;
                } else {
                    // all nodes in the array or HTMLElement collection are consolidated under
                    // a single dummy parent element
                    const dummyParent = document.createElement('div');
                    for (const elt of [...newContent]) {
                        dummyParent.append(elt);
                    }
                    return dummyParent;
                }
            }

            function insertSiblings(previousSibling, morphedNode, nextSibling) {
                let stack = []
                let added = []
                while (previousSibling != null) {
                    stack.push(previousSibling);
                    previousSibling = previousSibling.previousSibling;
                }
                while (stack.length > 0) {
                    let node = stack.pop();
                    added.push(node); // push added preceding siblings on in order and insert
                    morphedNode.parentElement.insertBefore(node, morphedNode);
                }
                added.push(morphedNode);
                while (nextSibling != null) {
                    stack.push(nextSibling);
                    added.push(nextSibling); // here we are going in order, so push on as we scan, rather than add
                    nextSibling = nextSibling.nextSibling;
                }
                while (stack.length > 0) {
                    morphedNode.parentElement.insertBefore(stack.pop(), morphedNode.nextSibling);
                }
                return added;
            }

            function findBestNodeMatch(newContent, oldNode, ctx) {
                let currentElement = null;
                currentElement = newContent.firstChild;
                let bestElement = currentElement;
                let score = 0;
                while (currentElement) {
                    let newScore = scoreElement(currentElement, oldNode, ctx);
                    if (newScore > score) {
                        bestElement = currentElement;
                        score = newScore;
                    }
                    currentElement = currentElement.nextSibling;
                }
                return bestElement;
            }

            function scoreElement(node1, node2, ctx) {
                if (isSoftMatch(node1, node2)) {
                    return .5 + getIdIntersectionCount(ctx, node1, node2);
                }
                return 0;
            }

            function removeNode(tempNode, ctx) {
                removeIdsFromConsideration(ctx, tempNode)
                ctx.callbacks.beforeNodeRemoved(tempNode);
                tempNode.remove();
                ctx.callbacks.afterNodeRemoved(tempNode);
            }

            //=============================================================================
            // ID Set Functions
            //=============================================================================

            function isIdInConsideration(ctx, id) {
                return !ctx.deadIds.has(id);
            }

            function idIsWithinNode(ctx, id, targetNode) {
                let idSet = ctx.idMap.get(targetNode) || EMPTY_SET;
                return idSet.has(id);
            }

            function removeIdsFromConsideration(ctx, node) {
                let idSet = ctx.idMap.get(node) || EMPTY_SET;
                for (const id of idSet) {
                    ctx.deadIds.add(id);
                }
            }

            function getIdIntersectionCount(ctx, node1, node2) {
                let sourceSet = ctx.idMap.get(node1) || EMPTY_SET;
                let matchCount = 0;
                for (const id of sourceSet) {
                    // a potential match is an id in the source and potentialIdsSet, but
                    // that has not already been merged into the DOM
                    if (isIdInConsideration(ctx, id) && idIsWithinNode(ctx, id, node2)) {
                        ++matchCount;
                    }
                }
                return matchCount;
            }

            /**
             * A bottom up algorithm that finds all elements with ids inside of the node
             * argument and populates id sets for those nodes and all their parents, generating
             * a set of ids contained within all nodes for the entire hierarchy in the DOM
             *
             * @param node {Element}
             * @param {Map<Node, Set<String>>} idMap
             */
            function populateIdMapForNode(node, idMap) {
                let nodeParent = node.parentElement;
                // find all elements with an id property
                let idElements = node.querySelectorAll('[id]');
                for (const elt of idElements) {
                    let current = elt;
                    // walk up the parent hierarchy of that element, adding the id
                    // of element to the parent's id set
                    while (current !== nodeParent && current != null) {
                        let idSet = idMap.get(current);
                        // if the id set doesn't exist, create it and insert it in the  map
                        if (idSet == null) {
                            idSet = new Set();
                            idMap.set(current, idSet);
                        }
                        idSet.add(elt.id);
                        current = current.parentElement;
                    }
                }
            }

            /**
             * This function computes a map of nodes to all ids contained within that node (inclusive of the
             * node).  This map can be used to ask if two nodes have intersecting sets of ids, which allows
             * for a looser definition of "matching" than tradition id matching, and allows child nodes
             * to contribute to a parent nodes matching.
             *
             * @param {Element} oldContent  the old content that will be morphed
             * @param {Element} newContent  the new content to morph to
             * @returns {Map<Node, Set<String>>} a map of nodes to id sets for the
             */
            function createIdMap(oldContent, newContent) {
                let idMap = new Map();
                populateIdMapForNode(oldContent, idMap);
                populateIdMapForNode(newContent, idMap);
                return idMap;
            }

            //=============================================================================
            // This is what ends up becoming the Idiomorph global object
            //=============================================================================
            return {
                morph
            }
        })()
    }));

htmx.defineExtension('morph', {
    isInlineSwap: function(swapStyle) {
        return swapStyle === 'morph';
    },
    handleSwap: function (swapStyle, target, fragment) {
        if (swapStyle === 'morph' || swapStyle === 'morph:outerHTML') {
            return Idiomorph.morph(target, fragment.children);
        } else if (swapStyle === 'morph:innerHTML') {
            return Idiomorph.morph(target, fragment.children, {morphStyle:'innerHTML'});
        }
    }
});
