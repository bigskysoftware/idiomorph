import Idiomorph from './idiomorph.js';

htmx.defineExtension('morph', {
    isInlineSwap: function(swapStyle) {
        return swapStyle === 'morph';
    },
    handleSwap: function (swapStyle, target, fragment) {
        if (swapStyle === 'morph' || swapStyle === 'morph:outerHTML') {
            return Idiomorph.morph(target, fragment.children);
        } else if (swapStyle === 'morph:innerHTML') {
            return Idiomorph.morph(target, fragment.children, {morphStyle:'innerHTML'});
        }
    }
});

export default Idiomorph;
