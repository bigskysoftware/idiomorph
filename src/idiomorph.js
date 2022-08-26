class Idiomorph {

    static EMPTY_SET = new Set();

    static morph(oldNode, newNode) {
        const im = new Idiomorph();
        im.morphFrom(oldNode, newNode);
    }

    createIdMap(nodeArr) {
        let idMap = new Map();
        for (const node of nodeArr) {
            let nodeParent = node.parentElement;
            let idElements = node.querySelectorAll('[id]');
            for (const elt of idElements) {
                let current = elt;
                while (current !== nodeParent && current != null) {
                    let idSet = idMap.get(elt);
                    if (idSet == null) {
                        idSet = new Set();
                        idMap.put(elt, idSet);
                    }
                    idSet.add(elt.id);
                    current = elt.parentElement;
                }
            }
        }
        return idMap;
    }

    potentialIDMatchCount(idSet1, idSet2, idsAlreadyMerged) {
        let matchCount = 0;
        for (const id of idSet1) {
            if (!idsAlreadyMerged.has(id) && idSet2.has(id)) {
                ++matchCount;
            }
        }
        return matchCount;
    }

    setsIntersect(idSet1, idSet2) {
        for (const id of idSet1) {
            if (idSet2.has(id)) {
                return true;
            }
        }
        return false;
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
            if (node1.id === node2.id) {
                return true;
            } else {
                let idSet1 = this.getIdSet(node1);
                let idSet2 = this.getIdSet(node2);
                return this.potentialIDMatchCount(idSet1, idSet2) > 0;
            }
        }
        return false;
    }

    morphChildren(newNode, oldNode) {
        let children = newNode.childNodes;
        let insertionPoint = oldNode.firstChild;
        let idsAlreadyMerged = new Set();
        for (const newChild of children) {
            // if the current node is a good match (it shares ids) then morph
            if (this.goodMatch(newChild, insertionPoint, idsAlreadyMerged)) {
                this.morphFrom(insertionPoint, newChild);
                insertionPoint = insertionPoint.nextSibling;
            } else {
                // otherwise search forward in the existing siblings for
                // a good match
                let potentialMatch = insertionPoint.nextSibling;

                // track other potential id matches vs this newChild node
                let currentNodesPotentialIdMatches = this.potentialIDMatchCount(newChild, oldNode, idsAlreadyMerged);
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
                // if we found a potential match, remove the nodes until that
                // point and morph
                if (potentialMatch != null && this.goodMatch(newChild, potentialMatch, idsAlreadyMerged)) {
                    this.morphFrom(potentialMatch, newChild);
                    insertionPoint = potentialMatch.nextSibling;
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
                to.setAttribute(fromAttribute.name, fromAttribute.value);
            }
            for (const toAttribute of toAttributes) {
                if (!from.hasAttribute(toAttribute.name)) {
                    to.removeAttribute(toAttribute.name);
                }
            }
        }

        if (type === 8 /* comment */ || type === 3 /* text */) {
            if (from.nodeValue !== to.nodeValue) {
                to.nodeValue = from.nodeValue
            }
        }
    }

    getIdSet(node) {
        let idSet = this.nodeIdMap.get(node);
        return idSet || Idiomorph.EMPTY_SET;
    }
}
