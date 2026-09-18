/**
 * Edition gate. The free edition is the same code with a sprite ceiling;
 * the packaging script rewrites MAX_SPRITES when it builds the free ZIP.
 */
export const MAX_SPRITES = Infinity;
export const EDITION = 'full';

export function enforceLimit(count) {
  if (count > MAX_SPRITES) {
    throw new Error(
      `The free edition packs up to ${MAX_SPRITES} sprites per atlas; ` +
      `this run has ${count}. The full edition removes the limit.`
    );
  }
}
