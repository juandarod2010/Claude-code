/** Writers for Godot 4 text resources (`format=3`). */

const escape = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/** Godot serialises floats with a decimal point; 1 must not become "1". */
const float = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));

const rect2 = (x, y, w, h) => `Rect2(${x}, ${y}, ${w}, ${h})`;

/**
 * Compare names so that `run_2` sorts before `run_10`.
 * Plain lexicographic order would interleave frames and scramble animations.
 */
export function naturalCompare(a, b) {
  const split = (s) => s.match(/\d+|\D+/g) ?? [];
  const as = split(a);
  const bs = split(b);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const x = as[i];
    const y = bs[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const nx = /^\d/.test(x);
    const ny = /^\d/.test(y);
    if (nx && ny) {
      const d = Number(x) - Number(y);
      if (d !== 0) return d;
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
}

/**
 * Group sprite names into animations by stripping a trailing frame number.
 * `run_01`, `run_02` -> animation `run`. A name with no trailing number
 * becomes a single-frame animation of its own.
 */
export function groupAnimations(names) {
  const groups = new Map();
  for (const name of names) {
    const match = name.match(/^(.*?)[-_. ]*(\d+)$/);
    const key = match && match[1] !== '' ? match[1] : name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(name);
  }
  for (const frames of groups.values()) frames.sort(naturalCompare);
  return new Map([...groups.entries()].sort((a, b) => naturalCompare(a[0], b[0])));
}

/**
 * Godot's AtlasTexture reports `region.size + margin.size` as its size and
 * draws at `position + margin.position` (see AtlasTexture::get_width and
 * AtlasTexture::draw in the engine source). So `margin.size` is the TOTAL
 * number of pixels trimmed away on each axis, not the right/bottom edge.
 * Writing the right/bottom edge here is a subtle, classic mistake: the sprite
 * lands in the right place but reports the wrong size.
 */
function marginRect2(m) {
  return rect2(m.left, m.top, m.left + m.right, m.top + m.bottom);
}

/**
 * Build a SpriteFrames resource pointing at one atlas texture.
 *
 * Trimmed sprites carry a `margin`, which is how Godot restores the original
 * untrimmed footprint: without it every frame snaps to its trimmed bounds and
 * the animation visibly jitters.
 */
export function spriteFramesTres(sprites, { texturePath, fps = 10, loop = true }) {
  const byName = new Map(sprites.map((s) => [s.name, s]));
  const animations = groupAnimations(sprites.map((s) => s.name));

  const subResources = [];
  const ids = new Map();
  let index = 0;
  for (const frames of animations.values()) {
    for (const name of frames) {
      const sprite = byName.get(name);
      const id = `AtlasTexture_sf${index++}`;
      ids.set(name, id);
      const lines = [
        `[sub_resource type="AtlasTexture" id="${id}"]`,
        `atlas = ExtResource("1_atlas")`,
        `region = ${rect2(sprite.x, sprite.y, sprite.width, sprite.height)}`,
      ];
      const m = sprite.margin;
      if (m && (m.left || m.top || m.right || m.bottom)) {
        lines.push(`margin = ${marginRect2(m)}`);
      }
      subResources.push(lines.join('\n'));
    }
  }

  const blocks = [];
  for (const [animation, frames] of animations) {
    const frameList = frames
      .map((name) => `{\n"duration": 1.0,\n"texture": SubResource("${ids.get(name)}")\n}`)
      .join(', ');
    blocks.push(
      `{\n"frames": [${frameList}],\n"loop": ${loop ? 1 : 0},\n` +
      `"name": &"${escape(animation)}",\n"speed": ${float(fps)}\n}`
    );
  }

  // load_steps counts every external and sub-resource, plus the resource itself.
  const loadSteps = subResources.length + 2;

  return [
    `[gd_resource type="SpriteFrames" load_steps=${loadSteps} format=3]`,
    '',
    `[ext_resource type="Texture2D" path="${escape(texturePath)}" id="1_atlas"]`,
    '',
    subResources.join('\n\n'),
    '',
    '[resource]',
    `animations = [${blocks.join(', ')}]`,
    '',
  ].join('\n');
}

/** A standalone AtlasTexture resource, for static sprites used with Sprite2D. */
export function atlasTextureTres(sprite, texturePath) {
  const lines = [
    '[gd_resource type="AtlasTexture" load_steps=2 format=3]',
    '',
    `[ext_resource type="Texture2D" path="${escape(texturePath)}" id="1_atlas"]`,
    '',
    '[resource]',
    'atlas = ExtResource("1_atlas")',
    `region = ${rect2(sprite.x, sprite.y, sprite.width, sprite.height)}`,
  ];
  const m = sprite.margin;
  if (m && (m.left || m.top || m.right || m.bottom)) {
    lines.push(`margin = ${marginRect2(m)}`);
  }
  return lines.join('\n') + '\n';
}
