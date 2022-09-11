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

            function morph(oldNode, newContent) {
                if (typeof newContent === 'string') {
                    newContent = parseContent(newContent);
                }
                let morphContext = createMorphContext(oldNode, newContent)
                return morphOldNodeTo(oldNode, newContent, morphContext);
            }

            function morphOldNodeTo(oldNode, newContent, ctx) {
                if (oldNode.tagName !== newContent.tagName) {
                    oldNode.parentElement.replaceChild(newContent, oldNode);
                    return newContent;
                } else {
                    syncNodeFrom(newContent, oldNode);
                    morphChildren(newContent, oldNode, ctx);
                    return oldNode;
                }
            }

            function morphChildren(newContent, oldParent, ctx) {
                let nextNewChild = newContent.firstChild;
                let insertionPoint = oldParent.firstChild;

                // run through all the new content
                while (nextNewChild) {
                    let newChild = nextNewChild;
                    nextNewChild = newChild.nextSibling;

                    // if we are at the end of the exiting parent's children, just append
                    if (insertionPoint == null) {
                        oldParent.appendChild(newChild);
                        // if the current node has an ID match then morph
                    } else if (isIdSetMatch(newChild, insertionPoint, ctx)) {
                        morphOldNodeTo(insertionPoint, newChild, ctx);
                        insertionPoint = insertionPoint.nextSibling;
                    } else {

                        // otherwise search forward in the existing old children for an id match
                        let foundIdMatch = findIdSetMatch(newContent, oldParent, newChild, insertionPoint, ctx);

                        // if we found a potential match, remove the nodes until that
                        // point and morph
                        if (foundIdMatch) {
                            insertionPoint = removeNodesBetween(insertionPoint, foundIdMatch, ctx);
                            morphOldNodeTo(foundIdMatch, newChild, ctx);
                        } else {
                            // no id matches found, scan forward for a soft match for the current node
                            let foundSoftMatch = findSoftMatch(newContent, oldParent, newChild, insertionPoint, ctx);
                            // if we found a soft match node, morph
                            if (foundSoftMatch) {
                                insertionPoint = removeNodesBetween(insertionPoint, foundSoftMatch(), ctx);
                                morphOldNodeTo(insertionPoint, newChild, ctx);
                            } else {
                                // Abandon all hope of morphing, just insert the new child
                                // before the insertion point and move on
                                oldParent.insertBefore(newChild, insertionPoint);
                            }
                        }
                    }

                    // ids already merged
                    removeIdsFromConsideration(ctx, newChild);
                }

                // remove any remaining old nodes
                while (insertionPoint !== null) {
                    let tempNode = insertionPoint;
                    insertionPoint = insertionPoint.nextSibling;
                    tempNode.remove();
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

            function createMorphContext(oldNode, newContent) {
                return {
                    idMap: createIdMap([oldNode, newContent]),
                    deadIds: new Set()
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

            function removeNodesBetween(insertionPoint, potentialMatch, ctx) {
                while (insertionPoint !== potentialMatch) {
                    let tempNode = insertionPoint;
                    insertionPoint = insertionPoint.nextSibling;
                    tempNode.remove();
                    removeIdsFromConsideration(ctx, tempNode);
                }
                removeIdsFromConsideration(ctx, insertionPoint);
                return insertionPoint.nextSibling;
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

                let potentialMatch = insertionPoint;

                // only search forward if there is a possibility of an id match
                if (newChildPotentialIdCount > 0) {
                    // if there is a possibility of an id match, scan forward
                    // keep track of the potential id match count we are discarding (the
                    // newChildPotentialIdCount must be greater than this to make it likely
                    // worth it)
                    let otherMatchCount = 0;
                    while (potentialMatch != null && !isIdSetMatch(newChild, potentialMatch, ctx)) {
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
                return responseDoc.body.querySelector('template').content.firstElementChild
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
             * This function computes a map of nodes to all ids contained within that node (inclusive of the
             * node).  This map can be used to ask if two nodes have intersecting sets of ids, which allows
             * for a looser definition of "matching" than tradition id matching, and allows child nodes
             * to contribute to a parent nodes matching.
             *
             * @param {Element[]} nodeArr  - A string param.
             * @returns {Map<Node, Set<String>>} - A map of nodes to id sets for the
             */
            function createIdMap(nodeArr) {
                let idMap = new Map();
                // for each top level node
                for (const node of nodeArr) {
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