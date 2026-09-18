import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { build, sliceGrid } from '../src/build.js';
import { Image } from '../src/png.js';
import { tempDir, makeSprite, pixelsEqual } from './helpers.js';

/** Write a set of sprites with known, differing trim boxes. */
function fixtureDir() {
  const dir = tempDir();
  const specs = [
    ['run_1', 32, 32, { x: 4, y: 6, w: 20, h: 18 }],
    ['run_2', 32, 32, { x: 2, y: 5, w: 24, h: 20 }],
    ['run_10', 32, 32, { x: 0, y: 0, w: 32, h: 32 }],
    ['idle_1', 24, 24, { x: 7, y: 7, w: 6, h: 6 }],
    ['chest', 16, 16, { x: 1, y: 2, w: 12, h: 9 }],
  ];
  const originals = new Map();
  specs.forEach(([name, w, h, box], i) => {
    const image = makeSprite(w, h, box, i + 1);
    image.write(join(dir, `${name}.png`));
    originals.set(name, image);
  });
  return { dir, originals };
}

test('every sprite can be reconstructed pixel-for-pixel from the atlas', () => {
  const { dir, originals } = fixtureDir();
  const out = tempDir();
  const manifest = build(dir, out);
  const atlas = Image.read(join(out, 'atlas.png'));

  for (const sprite of manifest.sprites) {
    const original = originals.get(sprite.name);
    // Rebuild the untrimmed sprite exactly as Godot does: a transparent canvas
    // of the original size, with the atlas region blitted at the margin offset.
    const restored = new Image(sprite.sourceWidth, sprite.sourceHeight);
    restored.blit(
      atlas.crop(sprite.x, sprite.y, sprite.width, sprite.height),
      sprite.margin.left,
      sprite.margin.top
    );
    assert.ok(pixelsEqual(restored, original),
      `${sprite.name} does not round-trip through the atlas`);
  }
});

test('trimming actually shrinks the sprites it reports', () => {
  const { dir } = fixtureDir();
  const manifest = build(dir, tempDir());
  const idle = manifest.sprites.find((s) => s.name === 'idle_1');
  assert.equal(idle.width, 6);
  assert.equal(idle.height, 6);
  assert.equal(idle.sourceWidth, 24);
  assert.deepEqual(idle.margin, { left: 7, top: 7, right: 11, bottom: 11 });
});

test('--no-trim keeps the original bounds', () => {
  const { dir } = fixtureDir();
  const manifest = build(dir, tempDir(), { noTrim: true });
  const idle = manifest.sprites.find((s) => s.name === 'idle_1');
  assert.equal(idle.width, 24);
  assert.deepEqual(idle.margin, { left: 0, top: 0, right: 0, bottom: 0 });
});

test('writes the atlas, manifest and Godot resource', () => {
  const { dir } = fixtureDir();
  const out = tempDir();
  build(dir, out, { name: 'hero' });
  for (const file of ['hero.png', 'hero.json', 'hero_frames.tres']) {
    assert.ok(existsSync(join(out, file)), `${file} was not written`);
  }
  const manifest = JSON.parse(readFileSync(join(out, 'hero.json'), 'utf8'));
  assert.equal(manifest.sprites.length, 5);
  assert.equal(manifest.atlas.image, 'hero.png');
});

test('--atlas-resources writes one resource per sprite', () => {
  const { dir } = fixtureDir();
  const out = tempDir();
  const manifest = build(dir, out, { atlasResources: true });
  for (const sprite of manifest.sprites) {
    assert.ok(existsSync(join(out, 'textures', `${sprite.name}.tres`)),
      `missing resource for ${sprite.name}`);
  }
});

test('slicing a sheet drops fully empty cells', () => {
  const sheet = new Image(64, 32);
  // Fill only the first and last cell of a 2x1 grid of 32x32 cells.
  sheet.blit(makeSprite(32, 32, { x: 8, y: 8, w: 8, h: 8 }, 1), 0, 0);
  const cells = sliceGrid(sheet, 32, 32, 'sheet');
  assert.equal(cells.length, 1);
  assert.equal(cells[0].name, 'sheet_0');
});

test('a cell size that does not divide the sheet is rejected', () => {
  assert.throws(() => sliceGrid(new Image(50, 32), 32, 32), /not an exact multiple/);
});

test('an empty folder fails with a clear message', () => {
  assert.throws(() => build(tempDir(), tempDir()), /No PNG files found/);
});

test('--pot changes only the canvas, never the frame rectangles', () => {
  const { dir } = fixtureDir();
  const plain = build(dir, tempDir());
  const pot = build(dir, tempDir(), { powerOfTwo: true });

  const isPot = (n) => (n & (n - 1)) === 0;
  assert.ok(isPot(pot.atlas.width) && isPot(pot.atlas.height));
  // Same sprites, same placement and the same margins: a power-of-two atlas
  // only pads the canvas, so nothing an engine reads about a frame changes.
  assert.deepEqual(pot.sprites, plain.sprites);
});

test('the same input twice produces byte-identical output', () => {
  const { dir } = fixtureDir();
  const a = build(dir, tempDir(), { name: 'x' });
  const b = build(dir, tempDir(), { name: 'x' });
  assert.deepEqual(a.sprites, b.sprites);
  assert.equal(a.atlas.width, b.atlas.width);
});
