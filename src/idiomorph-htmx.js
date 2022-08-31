htmx.defineExtension('morph', {
    isInlineSwap: function(swapStyle) {
        return swapStyle === 'morph';
    },
    handleSwap: function (swapStyle, target, fragment) {
        if (swapStyle === 'morph') {
            return Idiomorph.morph(target, fragment.firstElementChild);
        }
    }
});
