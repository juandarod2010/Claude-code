import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trim } from '../src/trim.js';
import { makeSprite } from './helpers.js';
import { Image } from '../src/png.js';

test('finds the tight bounding box of opaque pixels', () => {
  const image = makeSprite(32, 32, { x: 5, y: 7, w: 10, h: 4 });
  const t = trim(image);
  assert.deepEqual(
    { x: t.x, y: t.y, width: t.width, height: t.height },
    { x: 5, y: 7, width: 10, height: 4 }
  );
});

test('margins restore the original footprint', () => {
  const image = makeSprite(64, 48, { x: 3, y: 9, w: 20, h: 11 });
  const t = trim(image);
  assert.equal(t.margin.left + t.width + t.margin.right, 64);
  assert.equal(t.margin.top + t.height + t.margin.bottom, 48);
  assert.equal(t.margin.left, 3);
  assert.equal(t.margin.top, 9);
});

test('a sprite touching every edge needs no margin', () => {
  const image = makeSprite(16, 16, { x: 0, y: 0, w: 16, h: 16 });
  const t = trim(image);
  assert.deepEqual(t.margin, { left: 0, top: 0, right: 0, bottom: 0 });
});

test('a fully transparent image yields a valid 1x1 rect, not a zero-sized one', () => {
  const t = trim(new Image(8, 8));
  assert.equal(t.empty, true);
  assert.equal(t.width, 1);
  assert.equal(t.height, 1);
});

test('the alpha threshold ignores near-transparent fringes', () => {
  const image = new Image(8, 8);
  const soft = (4 * 8 + 4) * 4;
  image.data[soft + 3] = 3;
  const hard = (2 * 8 + 2) * 4;
  image.data[hard + 3] = 255;
  const t = trim(image, 8);
  assert.deepEqual({ x: t.x, y: t.y, width: t.width, height: t.height },
    { x: 2, y: 2, width: 1, height: 1 });
});
