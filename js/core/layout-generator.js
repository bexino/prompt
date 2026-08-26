const pageRotationSeed = (() => {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    window.crypto.getRandomValues(values);
    return `${values[0]}-${values[1]}`;
  }
  return `${Date.now()}-${Math.random()}`;
})();

function getBalancedTocToneFlags(categories) {
      const count = categories.length;
      if (count === 0) return [];

      const categoryKey = categories.map(item => item.title).join('\n');
      let randomState = hashString(`${pageRotationSeed}:toc-tone-shuffle:${categoryKey}`) || 0x9e3779b9;
      const nextRandom = () => {
        randomState ^= randomState << 13;
        randomState ^= randomState >>> 17;
        randomState ^= randomState << 5;
        return randomState >>> 0;
      };

      const shuffledIndexes = Array.from({ length: count }, (_, index) => index);
      for (let index = count - 1; index > 0; index--) {
        const swapIndex = nextRandom() % (index + 1);
        [shuffledIndexes[index], shuffledIndexes[swapIndex]] = [shuffledIndexes[swapIndex], shuffledIndexes[index]];
      }

      const deepCount = Math.floor(count / 2) + (count % 2 === 1 && (nextRandom() & 1) === 1 ? 1 : 0);
      const flags = Array(count).fill(false);
      shuffledIndexes.slice(0, deepCount).forEach(index => {
        flags[index] = true;
      });
      return flags;
    }

function getStableNoteLayout(key) {
      const hash = hashString(key);
      const rotationHash = hashString(`${pageRotationSeed}:note:${key}`);
      const copyTabRotationHash = hashString(`${pageRotationSeed}:copy-tab:${key}`);
      const copyTabOffsetHash = hashString(`${pageRotationSeed}:copy-tab-offset:${key}`);
      const decorationHash = hashString(`${pageRotationSeed}:decoration:${key}`);
      let rotation = -5 + ((rotationHash % 1001) / 1000) * 10;
      const copyTabRotation = -5 + ((copyTabRotationHash % 1001) / 1000) * 10;
      const copyTabOffsetX = copyTabOffsetHash % 7;
      const copyTabOffsetY = -((copyTabOffsetHash >>> 8) % 7);
      if (Math.abs(rotation) < 0.7) {
        rotation = (rotationHash & 1) === 0 ? -1.1 : 1.1;
      }

      return {
        rotation: rotation.toFixed(2),
        mobileRotation: rotation.toFixed(2),
        copyTabRotation: copyTabRotation.toFixed(2),
        copyTabOffsetX,
        copyTabOffsetY,
        offsetX: ((hash >>> 11) % 27) - 13,
        offsetY: ((hash >>> 16) % 21) - 10,
        originX: 47 + ((hash >>> 19) % 7),
        originY: 48 + ((hash >>> 22) % 8),
        shadowX: -6 + ((hash >>> 3) % 13),
        shadowY: 10 + ((hash >>> 6) % 9),
        shadowBlur: 5 + ((hash >>> 9) % 6),
        shadowOpacity: (0.58 + ((hash >>> 13) % 15) / 100).toFixed(2),
        contactShadowOpacity: (0.64 + ((hash >>> 18) % 17) / 100).toFixed(2),
        paperBrightness: (0.94 + ((hash >>> 24) % 6) / 100).toFixed(2),
        paperHoverBrightness: (0.98 + ((hash >>> 24) % 5) / 100).toFixed(2),
        topShadowVariant: (hash >>> 5) % 3,
        topShadowOpacity: (0.18 + ((hash >>> 18) % 21) / 100).toFixed(2),
        decoration: decorationHash % 20
      };
    }

function getStablePlaqueRotation(key) {
      const hash = hashString(`${pageRotationSeed}:plaque:${key}`);
      let rotation = -5 + ((hash % 1001) / 1000) * 10;
      if (Math.abs(rotation) < 1.2) {
        rotation = (hash & 1) === 0 ? -1.2 : 1.2;
      }

      return {
        rotation: rotation.toFixed(2),
        mobileRotation: (rotation * 0.65).toFixed(2)
      };
    }

function applyStableRibbonRotations(scope, namespace = 'page') {
      scope.querySelectorAll('.pn-ribbon').forEach((ribbon, index) => {
        const hash = hashString(`${pageRotationSeed}:ribbon:${namespace}:${index}`);
        const rotation = -5 + ((hash % 1001) / 1000) * 10;
        ribbon.style.setProperty('--ribbon-rotation', `${rotation.toFixed(2)}deg`);
      });
    }

function getStablePlaqueWear(key) {
      let state = hashString(`plaque-wear:${key}`);
      const random = () => {
        state += 0x6D2B79F5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
      };
      const between = (min, max) => min + random() * (max - min);

      return {
        aX: between(7, 31).toFixed(1),
        aY: between(19, 79).toFixed(1),
        aSize: between(4.5, 9).toFixed(1),
        aChip2Size: between(1.4, 3.6).toFixed(1),
        aAlpha: between(0.32, 0.55).toFixed(2),
        aLightAlpha: between(0.15, 0.31).toFixed(2),
        aChipDx: between(-3.2, 3.2).toFixed(1),
        aChipDy: between(-11, 11).toFixed(1),
        aChip2Dx: between(-3, 3).toFixed(1),
        aChip2Dy: between(-10, 10).toFixed(1),
        bX: between(38, 76).toFixed(1),
        bY: between(22, 82).toFixed(1),
        bSize: between(6, 11.5).toFixed(1),
        bChip2Size: between(1.6, 4.2).toFixed(1),
        bAlpha: between(0.35, 0.58).toFixed(2),
        bLightAlpha: between(0.16, 0.32).toFixed(2),
        bChipDx: between(-3.2, 3.2).toFixed(1),
        bChipDy: between(-12, 12).toFixed(1),
        bChip2Dx: between(-3, 3).toFixed(1),
        bChip2Dy: between(-10, 10).toFixed(1),
        cX: between(78, 94).toFixed(1),
        cY: between(18, 76).toFixed(1),
        cSize: between(3, 6.5).toFixed(1),
        cAlpha: between(0.2, 0.38).toFixed(2),
        scratchAngle: between(166, 188).toFixed(1),
        scratchStop: between(28, 72).toFixed(1),
        scratch2Angle: between(82, 108).toFixed(1),
        scratch2Stop: between(24, 76).toFixed(1)
      };
    }

function applyStablePlaqueWear(element, key) {
      if (!element) return;
      const wear = getStablePlaqueWear(key);
      element.style.setProperty('--wear-a-x', `${wear.aX}%`);
      element.style.setProperty('--wear-a-y', `${wear.aY}%`);
      element.style.setProperty('--wear-a-size', `${wear.aSize}px`);
      element.style.setProperty('--wear-a-chip-size', `${(Number(wear.aSize) * 0.46).toFixed(1)}px`);
      element.style.setProperty('--wear-a-chip2-size', `${wear.aChip2Size}px`);
      element.style.setProperty('--wear-a-alpha', wear.aAlpha);
      element.style.setProperty('--wear-a-light-alpha', wear.aLightAlpha);
      element.style.setProperty('--wear-a-chip-dx', `${wear.aChipDx}%`);
      element.style.setProperty('--wear-a-chip-dy', `${wear.aChipDy}%`);
      element.style.setProperty('--wear-a-chip2-dx', `${wear.aChip2Dx}%`);
      element.style.setProperty('--wear-a-chip2-dy', `${wear.aChip2Dy}%`);
      element.style.setProperty('--wear-b-x', `${wear.bX}%`);
      element.style.setProperty('--wear-b-y', `${wear.bY}%`);
      element.style.setProperty('--wear-b-size', `${wear.bSize}px`);
      element.style.setProperty('--wear-b-chip-size', `${(Number(wear.bSize) * 0.42).toFixed(1)}px`);
      element.style.setProperty('--wear-b-chip2-size', `${wear.bChip2Size}px`);
      element.style.setProperty('--wear-b-alpha', wear.bAlpha);
      element.style.setProperty('--wear-b-light-alpha', wear.bLightAlpha);
      element.style.setProperty('--wear-b-chip-dx', `${wear.bChipDx}%`);
      element.style.setProperty('--wear-b-chip-dy', `${wear.bChipDy}%`);
      element.style.setProperty('--wear-b-chip2-dx', `${wear.bChip2Dx}%`);
      element.style.setProperty('--wear-b-chip2-dy', `${wear.bChip2Dy}%`);
      element.style.setProperty('--wear-c-x', `${wear.cX}%`);
      element.style.setProperty('--wear-c-y', `${wear.cY}%`);
      element.style.setProperty('--wear-c-size', `${wear.cSize}px`);
      element.style.setProperty('--wear-c-alpha', wear.cAlpha);
      element.style.setProperty('--wear-scratch-angle', `${wear.scratchAngle}deg`);
      element.style.setProperty('--wear-scratch-stop', `${wear.scratchStop}%`);
      element.style.setProperty('--wear-scratch2-angle', `${wear.scratch2Angle}deg`);
      element.style.setProperty('--wear-scratch2-stop', `${wear.scratch2Stop}%`);
    }

function getNoteDecoration(decoration) {
  if (decoration >= 11) return null;
  return decoration % 2 === 0
    ? { className: 'tape', src: PromptNotebook.config.assets.decor('masking-tape.webp') }
    : { className: 'pin', src: PromptNotebook.config.assets.decor('brass-pin.webp') };
}

function getNotePaper(variant, colorTheme, shadowVariant) {
  const paperVariant = ['a', 'b', 'c'][variant % 3];
  const color = String(colorTheme || 'yellow').replace('pn-note-', '');
  return {
    variant: paperVariant,
    base: PromptNotebook.config.assets.note(paperVariant, color)
  };
}

Object.assign(PromptNotebook.core, { getBalancedTocToneFlags, getStableNoteLayout, getStablePlaqueRotation, applyStableRibbonRotations, getStablePlaqueWear, applyStablePlaqueWear, getNoteDecoration, getNotePaper });
