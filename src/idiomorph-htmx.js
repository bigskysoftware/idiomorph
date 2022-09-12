htmx.defineExtension('morph', {
    isInlineSwap: function(swapStyle) {
        return swapStyle === 'morph';
    },
    handleSwap: function (swapStyle, target, fragment) {
        if (swapStyle === 'morph' || swapStyle === 'morphOuterHTML') {
            return Idiomorph.morph(target, fragment.children);
        } else if (swapStyle === 'morphInnerHTML') {
            return Idiomorph.morph(target, fragment.children, {morphStyle:'innerHTML'});
        }
    }
});
