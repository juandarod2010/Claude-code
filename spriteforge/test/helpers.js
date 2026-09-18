import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Image } from '../src/png.js';

export const tempDir = () => mkdtempSync(join(tmpdir(), 'spriteforge-'));

/**
 * A sprite with a deterministic pattern and a known opaque bounding box,
 * surrounded by transparent padding. Colour varies per pixel so a misplaced
 * blit cannot accidentally pass a comparison.
 */
export function makeSprite(width, height, box, seed = 1) {
  const image = new Image(width, height);
  for (let y = box.y; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      const i = (y * width + x) * 4;
      image.data[i] = (x * 7 + seed * 31) % 256;
      image.data[i + 1] = (y * 13 + seed * 17) % 256;
      image.data[i + 2] = (x * y + seed) % 256;
      image.data[i + 3] = 255;
    }
  }
  return image;
}

export function pixelsEqual(a, b) {
  if (a.width !== b.width || a.height !== b.height) return false;
  return a.data.equals(b.data);
}
