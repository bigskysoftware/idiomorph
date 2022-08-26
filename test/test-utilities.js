/* Test Utilities */

function byId(id) {
    return document.getElementById(id);
}

function make(htmlStr) {
    var makeFn = function () {
        var range = document.createRange();
        var fragment = range.createContextualFragment(htmlStr);
        var wa = getWorkArea();
        var child = null;
        while(fragment.children.length > 0) {
            child = fragment.children[0];
            wa.appendChild(child);
        }
        return child; // return last added element
    };
    if (getWorkArea()) {
        return makeFn();
    } else {
        ready(makeFn);
    }
}

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function getWorkArea() {
    return byId("work-area");
}

function clearWorkArea() {
    getWorkArea().innerHTML = "";
}

function removeWhiteSpace(str) {
    return str.replace(/\s/g, "");
}


function log(val) {
    console.log(val);
    return val;
}