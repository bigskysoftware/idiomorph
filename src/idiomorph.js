let Idiomorph = (function(){

    let EMPTY_SET = new Set();

    function morph(oldNode, newContent) {
        if (typeof newContent === 'string') {
            let parser = new DOMParser();
            let responseDoc = parser.parseFromString("<body><template>" + newContent + "</template></body>", "text/html");
            newContent = responseDoc.body.querySelector('template').content.firstElementChild
        }
        let morphContext = createMorphContext(oldNode, newContent)
        return morphFrom(oldNode, newContent, morphContext);
    }

    function createMorphContext(oldNode, newContent) {
        let idMap = createIdMap([oldNode, newContent]);
        let mergedIds = new Set();
        let ctx = {
            idMap: idMap,
            mergedIds: mergedIds,
            getIdSet: function (node) {
                let idSet = idMap.get(node);
                return idSet || EMPTY_SET;
            },
            alreadyMerged : function(id) {
                mergedIds.has(id);
            },
            idIsWithinNode : function(id, targetNode) {
                let idSet = ctx.getIdSet(targetNode);
                return idSet.has(id);
            }
        };
        return ctx
    }

    function potentialIDMatchCount(sourceNode, targetNode, ctx) {
        let sourceSet = ctx.getIdSet(sourceNode);
        let matchCount = 0;
        for (const id of sourceSet) {
            // a potential match is an id in the source and potentialIdsSet, but
            // that has not already been merged into the DOM
            if (!ctx.alreadyMerged(id) && ctx.idIsWithinNode(id, targetNode)) {
                ++matchCount;
            }
        }
        return matchCount;
    }

    function morphFrom(oldNode, newContent, ctx) {
        if (oldNode.tagName !== newContent.tagName) {
            oldNode.parentElement.replaceChild(newContent, oldNode);
            return newContent;
        } else {
            syncNodeFrom(newContent, oldNode);
            morphChildren(newContent, oldNode, ctx);
            return oldNode;
        }
    }

    function hasIdMatch(node1, node2, ctx) {
        if (node1.tagName === node2.tagName) {
            if (node1.id !== "" && node1.id === node2.id) {
                return true;
            } else {
                return potentialIDMatchCount(node1, node2, ctx) > 0;
            }
        }
        return false;
    }

    function morphChildren(newContent, oldParent, ctx) {
        // console.log("----------------------------------------")
        // console.log("merging children of ", newNode.outerHTML);
        // console.log("  into ", oldNode.outerHTML);
        // console.log("----------------------------------------")
        let nextNewChild = newContent.firstChild;
        let insertionPoint = oldParent.firstChild;

        // run through all the new content
        while(nextNewChild) {
            let newChild = nextNewChild;
            nextNewChild = newChild.nextSibling;

            // if we are at the end of the children, just append
            if (insertionPoint == null) {
                oldParent.appendChild(newChild);
                // if the current node is a good match (it shares ids) then morph
            } else if (hasIdMatch(newChild, insertionPoint, ctx)) {
                morphFrom(insertionPoint, newChild, ctx);
                insertionPoint = insertionPoint.nextSibling;
            } else {
                // otherwise maybe search forward in the existing siblings for
                // a good match

                // track other potential id matches vs newChild node
                let currentNodesPotentialIdMatches = potentialIDMatchCount(newChild, oldParent, ctx);

                let potentialMatch = null;
                // only search forward if there is a possibility of a good match
                if (currentNodesPotentialIdMatches > 0) {
                    potentialMatch = insertionPoint.nextSibling;
                    let otherPotentialIdMatches = 0;
                    while (potentialMatch != null && !hasIdMatch(newChild, potentialMatch, ctx)) {
                        otherPotentialIdMatches += potentialIDMatchCount(potentialMatch, newContent, ctx);
                        if (otherPotentialIdMatches > currentNodesPotentialIdMatches) {
                            // if we have more other potential matches, break out of looking forward
                            // so we don't discard those potential matches
                            potentialMatch = null;
                            break;
                        }
                        potentialMatch = potentialMatch.nextSibling;
                    }
                }

                // if we found a potential match, remove the nodes until that
                // point and morph
                if (potentialMatch != null && hasIdMatch(newChild, potentialMatch, ctx)) {
                    morphFrom(potentialMatch, newChild, ctx);
                    while (insertionPoint !== potentialMatch) {
                        let tempNode = insertionPoint;
                        insertionPoint = insertionPoint.nextSibling;
                        tempNode.remove();
                    }
                    insertionPoint = insertionPoint.nextSibling;
                } else {
                    // no good matches found, scan forward until we run into a potential match for the current
                    // node that isn't going to match anything else
                    while (insertionPoint &&
                           (newChild.nodeType !== insertionPoint.nodeType || newChild.tagName !== insertionPoint.tagName) &&
                             potentialIDMatchCount(insertionPoint, newContent, ctx) === 0) {
                        let tempNode = insertionPoint;
                        insertionPoint = insertionPoint.nextSibling;
                        tempNode.remove();
                    }

                    // if we found a matching node, morph
                    if (insertionPoint && newChild.nodeType === insertionPoint.nodeType &&
                        newChild.tagName === insertionPoint.tagName &&
                        potentialIDMatchCount(insertionPoint, newContent, ctx) === 0) {
                        morphFrom(insertionPoint, newChild, ctx);
                        insertionPoint = insertionPoint.nextSibling;
                    } else {
                        // Abandon all hope of morphing, just insert the new child
                        // before the insertion point and move on
                        oldParent.insertBefore(newChild, insertionPoint);
                    }
                }
            }

            // ids already merged
            let idSet = ctx.getIdSet(newChild);
            for (const id of idSet) {
                ctx.mergedIds.add(id);
            }
        }

        // remove any remaining old nodes
        while (insertionPoint !== null) {
            let tempNode = insertionPoint;
            insertionPoint = insertionPoint.nextSibling;
            tempNode.remove();
        }
    }


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
        if (from.nodeName === "INPUT" && type !== 'file') {
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
        } else if (from.nodeName === "OPTION") {
            syncBooleanAttribute(from, to, 'selected')
        } else if (from.nodeName === "TEXTAREA") {
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

    /*
   Creates a map of elements to the ids contained within that element.
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
                // of element to the parents id set
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
    
    return {
        morph
    }
})()
