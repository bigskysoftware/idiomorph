/* Test Utilities */

function make(htmlStr) {
    let range = document.createRange();
    let fragment = range.createContextualFragment(htmlStr);

    let element = fragment.children[0];
    element.childMutations = 0;
    element.attrMutations = 0;

    let observer = new MutationObserver((mutationList, observer) => {
        console.log(element, mutationList);
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                element.childMutations++;
            } else if (mutation.type === 'attributes') {
                element.attrMutations++;
            }
        }
    });
    observer.observe(element, {attributes: true, childList: true, subtree: true});

    return element;
}

function getWorkArea() {
    return document.getElementById("work-area");
}

function clearWorkArea() {
    getWorkArea().innerHTML = "";
}

function print(elt) {
    let text = document.createTextNode( elt.innerHTML + "\n\n" );
    getWorkArea().appendChild(text);
    return elt;
}