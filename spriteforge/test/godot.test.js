import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spriteFramesTres, atlasTextureTres, groupAnimations, naturalCompare } from '../src/godot.js';

const sprites = [
  { name: 'run_1', x: 0, y: 0, width: 20, height: 18, margin: { left: 4, top: 6, right: 8, bottom: 8 } },
  { name: 'run_2', x: 21, y: 0, width: 24, height: 20, margin: { left: 2, top: 5, right: 6, bottom: 7 } },
  { name: 'chest', x: 0, y: 21, width: 12, height: 9, margin: { left: 0, top: 0, right: 0, bottom: 0 } },
];

test('frames sort numerically, not lexicographically', () => {
  const sorted = ['run_10', 'run_2', 'run_1'].sort(naturalCompare);
  assert.deepEqual(sorted, ['run_1', 'run_2', 'run_10']);
});

test('animations group by name with the frame number stripped', () => {
  const groups = groupAnimations(['run_1', 'run_2', 'idle_01', 'chest']);
  assert.deepEqual([...groups.keys()], ['chest', 'idle', 'run']);
  assert.deepEqual(groups.get('run'), ['run_1', 'run_2']);
  assert.deepEqual(groups.get('chest'), ['chest']);
});

test('uses Godot 4 resource syntax', () => {
  const tres = spriteFramesTres(sprites, { texturePath: 'res://atlas.png' });
  assert.match(tres, /^\[gd_resource type="SpriteFrames" load_steps=\d+ format=3\]/);
  assert.match(tres, /\[ext_resource type="Texture2D" path="res:\/\/atlas\.png" id="1_atlas"\]/);
  // Godot 4 quotes resource ids; Godot 3 used bare integers.
  assert.match(tres, /ExtResource\("1_atlas"\)/);
  assert.match(tres, /SubResource\("AtlasTexture_sf\d+"\)/);
  assert.doesNotMatch(tres, /ExtResource\(\s*\d+\s*\)/);
});

test('loop is serialised as an integer, the way Godot writes it', () => {
  const looping = spriteFramesTres(sprites, { texturePath: 'res://a.png', loop: true });
  assert.match(looping, /"loop": 1,/);
  assert.doesNotMatch(looping, /"loop": true/);
  const once = spriteFramesTres(sprites, { texturePath: 'res://a.png', loop: false });
  assert.match(once, /"loop": 0,/);
});

test('animation names are StringNames and speed is a float', () => {
  const tres = spriteFramesTres(sprites, { texturePath: 'res://a.png', fps: 12 });
  assert.match(tres, /"name": &"run",/);
  assert.match(tres, /"speed": 12\.0/);
});

test('trimmed sprites carry a margin and untrimmed ones do not', () => {
  const tres = spriteFramesTres(sprites, { texturePath: 'res://a.png' });
  // run_1: trimmed to 20x18 from 32x32, offset (4, 6).
  // Godot wants margin.size = total trimmed = (4+8, 6+8) = (12, 14).
  assert.match(tres, /region = Rect2\(0, 0, 20, 18\)\nmargin = Rect2\(4, 6, 12, 14\)/);
  // `chest` has no margin, so the default must be left out entirely.
  assert.match(tres, /region = Rect2\(0, 21, 12, 9\)\n\n/);
});

test('margin restores the original size the way the engine computes it', () => {
  // Godot: get_width() == region.size.width + margin.size.width.
  // Reproduce that arithmetic and demand the original dimensions back.
  for (const sprite of sprites) {
    const tres = atlasTextureTres(sprite, 'res://a.png');
    const region = tres.match(/region = Rect2\((\d+), (\d+), (\d+), (\d+)\)/).slice(1).map(Number);
    const margin = tres.match(/margin = Rect2\((\d+), (\d+), (\d+), (\d+)\)/)?.slice(1).map(Number)
      ?? [0, 0, 0, 0];
    const originalWidth = sprite.width + sprite.margin.left + sprite.margin.right;
    const originalHeight = sprite.height + sprite.margin.top + sprite.margin.bottom;
    assert.equal(region[2] + margin[2], originalWidth, `${sprite.name} width`);
    assert.equal(region[3] + margin[3], originalHeight, `${sprite.name} height`);
    // margin.position is the draw offset, i.e. the left/top trim.
    assert.equal(margin[0], sprite.margin.left);
    assert.equal(margin[1], sprite.margin.top);
  }
});

test('load_steps counts every resource in the file', () => {
  const tres = spriteFramesTres(sprites, { texturePath: 'res://a.png' });
  const declared = Number(tres.match(/load_steps=(\d+)/)[1]);
  const subs = [...tres.matchAll(/^\[sub_resource /gm)].length;
  const exts = [...tres.matchAll(/^\[ext_resource /gm)].length;
  assert.equal(declared, subs + exts + 1);
});

test('each sub-resource id is unique', () => {
  const tres = spriteFramesTres(sprites, { texturePath: 'res://a.png' });
  const ids = [...tres.matchAll(/\[sub_resource type="AtlasTexture" id="([^"]+)"\]/g)].map((m) => m[1]);
  assert.equal(ids.length, sprites.length);
  assert.equal(new Set(ids).size, ids.length);
});

test('quotes in names are escaped so the file stays parseable', () => {
  const tres = spriteFramesTres(
    [{ name: 'we"ird', x: 0, y: 0, width: 4, height: 4, margin: { left: 0, top: 0, right: 0, bottom: 0 } }],
    { texturePath: 'res://a.png' }
  );
  assert.match(tres, /"name": &"we\\"ird"/);
});

test('a standalone AtlasTexture resource is self-contained', () => {
  const tres = atlasTextureTres(sprites[0], 'res://atlas.png');
  assert.match(tres, /^\[gd_resource type="AtlasTexture" load_steps=2 format=3\]/);
  assert.match(tres, /atlas = ExtResource\("1_atlas"\)/);
  assert.match(tres, /region = Rect2\(0, 0, 20, 18\)/);
  assert.match(tres, /margin = Rect2\(4, 6, 12, 14\)/);
});
