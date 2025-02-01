(function () {
  function createMorphConfig(swapStyle) {
    if (swapStyle.startsWith("morph")) {
      swapStyle = swapStyle.replaceAll(';;',':').slice(5);
      if (swapStyle === "" || swapStyle === ":outerHTML") {
        return { morphStyle: "outerHTML" };
      } else if (swapStyle === ":innerHTML") {
        return { morphStyle: "innerHTML" };
      } else if (swapStyle.startsWith(":")) {
        return Function("return (" + swapStyle.slice(1) + ")")();
      }
    }
  }

  htmx.defineExtension("morph", {
    isInlineSwap: function (swapStyle) {
      let config = createMorphConfig(swapStyle);
      return config?.morphStyle === "outerHTML" || config?.morphStyle == null;
    },
    handleSwap: function (swapStyle, target, fragment) {
      let config = createMorphConfig(swapStyle);
      if (config) {
        return Idiomorph.morph(target, fragment.children, config);
      }
    },
  });
})();
