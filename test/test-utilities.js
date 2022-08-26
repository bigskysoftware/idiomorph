/* Test Utilities */

function make(htmlStr) {
    let range = document.createRange();
    let fragment = range.createContextualFragment(htmlStr);
    return fragment.children[0];
}