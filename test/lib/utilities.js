/* Test Utilities */

function setup() {
    beforeEach(() => {
        if (window.useMoveBefore && !Element.prototype.moveBefore) {
            throw new Error('Element.prototype.moveBefore is not available.');
        }
        clearWorkArea();
    });
}

function hasMoveBefore() {
  return !!document.body.moveBefore;
}

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

function setFocusAndSelection(elementId, selectedText) {
  const element = document.getElementById(elementId);
  const value = element.value
  const index = value.indexOf(selectedText);
  if(index === -1) throw `"${value}" does not contain "${selectedText}"`;
  element.focus();
  element.setSelectionRange(index, index + selectedText.length);
}

function setFocus(elementId) {
  document.getElementById(elementId).focus();
}

function assertFocusAndSelection(elementId, selectedText) {
  assertFocus(elementId);
  const activeElement = document.activeElement;
  activeElement.id.should.eql(elementId);
  activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd).should.eql(selectedText);
}

function assertFocus(elementId) {
  document.activeElement.id.should.eql(elementId);
}

function assertNoFocus() {
  document.activeElement.should.equal(document.body);
}

