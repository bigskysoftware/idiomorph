class Idiomorph {

    static EMPTY_SET = new Set();

    static morph(oldNode, newNode) {
        const im = new Idiomorph();
        im.morphFrom(oldNode, newNode);
    }

    /*
       Creates a map of elements to the ids contained within that element.
     */
    createIdMap(nodeArr) {
        let idMap = new Map();
        // for each top level node
        for (const node of nodeArr) {
            let nodeParent = node.parentElement;
            // find all elements with an id property
            let idElements = node.querySelectorAll('[id]');

            for (const elt of idElements) {
                let current = elt;
                // walk up the parent hierarchy of that element, adding the id
                // of this element to the parents id set
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

    potentialIDMatchCount(sourceNode, targetNode, idsAlreadyMerged) {
        let sourceSet = this.getIdSet(sourceNode);
        let potentialIdsSet = this.getIdSet(targetNode);
        let matchCount = 0;
        for (const id of sourceSet) {
            // a potential match is an id in the source and potentialIdsSet, but
            // that has not already been merged into the DOM
            if (!idsAlreadyMerged.has(id) && potentialIdsSet.has(id)) {
                ++matchCount;
            }
        }
        return matchCount;
    }

    morphFrom(oldNode, newNode) {
        this.nodeIdMap = this.nodeIdMap || this.createIdMap([oldNode, newNode]);
        if (oldNode.tagName !== newNode.tagName) {
            oldNode.parentElement.replaceChild(newNode, oldNode);
        } else {
            this.syncNodeFrom(newNode, oldNode);
            this.morphChildren(newNode, oldNode);
        }
    }

    goodMatch(node1, node2, idsAlreadyMerged) {
        if (node1.tagName === node2.tagName) {
            if (node1.id !== "" && node1.id === node2.id) {
                return true;
            } else {
                return this.potentialIDMatchCount(node1, node2, idsAlreadyMerged) > 0;
            }
        }
        return false;
    }

    morphChildren(newNode, oldNode) {
        console.log("----------------------------------------")
        console.log("merging children of ", newNode.outerHTML);
        console.log("  into ", oldNode.outerHTML);
        console.log("----------------------------------------")
        let children = [...newNode.childNodes]; // make a stable copy
        let insertionPoint = oldNode.firstChild;
        let idsAlreadyMerged = new Set();
        for (const newChild of children) {

            // if we are at the end of the children, just append
            if (insertionPoint == null) {
                oldNode.appendChild(newChild);
                // if the current node is a good match (it shares ids) then morph
            } else if (this.goodMatch(newChild, insertionPoint, idsAlreadyMerged)) {
                this.morphFrom(insertionPoint, newChild);
                insertionPoint = insertionPoint.nextSibling;
            } else {
                // otherwise maybe search forward in the existing siblings for
                // a good match

                // track other potential id matches vs this newChild node
                let currentNodesPotentialIdMatches = this.potentialIDMatchCount(newChild, oldNode, idsAlreadyMerged);

                let potentialMatch = null;
                // only search forward if there is a possibility of a good match
                if (currentNodesPotentialIdMatches > 0) {
                    potentialMatch = insertionPoint.nextSibling;
                    let otherPotentialIdMatches = 0;
                    while (potentialMatch != null && !this.goodMatch(newChild, potentialMatch, idsAlreadyMerged)) {
                        otherPotentialIdMatches += this.potentialIDMatchCount(potentialMatch, newNode, idsAlreadyMerged);
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
                if (potentialMatch != null && this.goodMatch(newChild, potentialMatch, idsAlreadyMerged)) {
                    this.morphFrom(potentialMatch, newChild);
                    while (insertionPoint !== potentialMatch) {
                        let tempNode = insertionPoint;
                        insertionPoint = insertionPoint.nextSibling;
                        tempNode.remove();
                    }
                    insertionPoint = insertionPoint.nextSibling;
                } else {
                    // no good matches found, if the current insertion point is a
                    // tag match, and it doesn't match any other potential merge
                    // nodes, morph
                    if (newChild.nodeType === insertionPoint.nodeType &&
                        newChild.tagName === insertionPoint.tagName &&
                        this.potentialIDMatchCount(insertionPoint, newNode, idsAlreadyMerged) === 0) {
                        this.morphFrom(insertionPoint, newChild);
                        insertionPoint = insertionPoint.nextSibling;
                    } else {
                        // Abandon all hope of morphing, just insert the new child
                        // before the insertion point and move on
                        oldNode.insertBefore(newChild, insertionPoint);
                    }
                }
            }

            // ids already merged
            let idSet = this.getIdSet(newChild);
            for (const id of idSet) {
                idsAlreadyMerged.add(id);
            }
        }

        // remove any remaining old nodes
        while (insertionPoint !== null) {
            let tempNode = insertionPoint;
            insertionPoint = insertionPoint.nextSibling;
            tempNode.remove();
        }
    }

    syncNodeFrom(from, to) {
        let type = from.nodeType

        // if this is an element type, sync the attributes from the
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

        if (type === 8 /* comment */ || type === 3 /* text */) {
            to.nodeValue = from.nodeValue
        }
    }

    getIdSet(node) {
        let idSet = this.nodeIdMap.get(node);
        return idSet || Idiomorph.EMPTY_SET;
    }
}
