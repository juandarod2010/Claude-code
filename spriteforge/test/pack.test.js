import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pack, packInto } from '../src/pack.js';

const rects = (n, seed = 1) =>
  Array.from({ length: n }, (_, i) => ({
    name: `s${i}`,
    width: 4 + ((i * 7 + seed) % 29),
    height: 4 + ((i * 11 + seed) % 23),
  }));

const overlaps = (a, b) =>
  a.x < b.x + b.width && b.x < a.x + a.width &&
  a.y < b.y + b.height && b.y < a.y + a.height;

test('packed sprites never overlap', () => {
  const { placed } = pack(rects(60), { padding: 0 });
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      assert.ok(!overlaps(placed[i], placed[j]),
        `${placed[i].name} overlaps ${placed[j].name}`);
    }
  }
});

test('padding keeps a real gap between sprites', () => {
  const padding = 2;
  const { placed } = pack(rects(40, 3), { padding });
  // Each sprite reserved padding extra pixels, so inflating by the padding
  // must still not overlap: that is what guarantees no texture bleeding.
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = { ...placed[i], width: placed[i].width + padding, height: placed[i].height + padding };
      const b = placed[j];
      assert.ok(!overlaps(a, b), `${a.name} bleeds into ${b.name}`);
    }
  }
});

test('every sprite stays inside the atlas bounds', () => {
  const { width, height, placed } = pack(rects(50, 5), { padding: 1 });
  for (const p of placed) {
    assert.ok(p.x >= 0 && p.y >= 0, `${p.name} has a negative origin`);
    assert.ok(p.x + p.width <= width, `${p.name} overflows the width`);
    assert.ok(p.y + p.height <= height, `${p.name} overflows the height`);
  }
});

test('all input sprites are placed exactly once', () => {
  const input = rects(37, 9);
  const { placed } = pack(input);
  assert.equal(placed.length, input.length);
  assert.equal(new Set(placed.map((p) => p.name)).size, input.length);
});

test('packing is deterministic regardless of input order', () => {
  const input = rects(45, 2);
  const a = pack(input);
  const b = pack([...input].reverse());
  assert.equal(a.width, b.width);
  assert.equal(a.height, b.height);
  const key = (r) => `${r.name}:${r.x},${r.y}`;
  assert.deepEqual(a.placed.map(key).sort(), b.placed.map(key).sort());
});

test('--pot produces power-of-two dimensions', () => {
  const { width, height } = pack(rects(30), { powerOfTwo: true });
  const isPot = (n) => (n & (n - 1)) === 0;
  assert.ok(isPot(width), `${width} is not a power of two`);
  assert.ok(isPot(height), `${height} is not a power of two`);
});

test('a sprite larger than the atlas limit fails loudly', () => {
  assert.throws(
    () => pack([{ name: 'huge', width: 5000, height: 10 }], { maxSize: 512 }),
    /do not fit/
  );
});

test('packInto reports failure instead of silently dropping sprites', () => {
  assert.equal(packInto([{ name: 'a', width: 20, height: 20 }], 8, 8, 0), null);
});
