/* Test Utilities */

function make(htmlStr) {
    let range = document.createRange();
    let fragment = range.createContextualFragment(htmlStr);

    let element = fragment.children[0];
    element.mutations = {elt: element, attribute:0, childrenAdded:0, childrenRemoved:0, characterData:0};

    let observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                element.mutations.childrenAdded += mutation.addedNodes.length;
                element.mutations.childrenRemoved += mutation.removedNodes.length;
            } else if (mutation.type === 'attributes') {
                element.mutations.attribute++;
            } else if (mutation.type === 'characterData') {
                element.mutations.characterData++;
            }
        }
    });
    observer.observe(fragment, {attributes: true, childList: true, subtree: true});

    return element;
}

function makeElements(htmlStr) {
    let range = document.createRange();
    let fragment = range.createContextualFragment(htmlStr);
    return fragment.children;
}

function parseHTML(src) {
    let parser = new DOMParser();
    return parser.parseFromString(src, "text/html");
}

function getWorkArea() {
    return document.getElementById("work-area");
}

function clearWorkArea() {
    getWorkArea().innerHTML = "";
}

function print(elt) {
    let text = document.createTextNode( elt.outerHTML + "\n\n" );
    getWorkArea().appendChild(text);
    return elt;
}