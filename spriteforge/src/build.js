import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { Image } from './png.js';
import { trim } from './trim.js';
import { pack } from './pack.js';
import { spriteFramesTres, atlasTextureTres, naturalCompare } from './godot.js';
import { enforceLimit } from './edition.js';

/** Cut a spritesheet into equal cells, row-major, skipping fully empty ones. */
export function sliceGrid(image, cellWidth, cellHeight, prefix = 'frame') {
  if (cellWidth <= 0 || cellHeight <= 0) {
    throw new Error('--cell dimensions must be positive.');
  }
  if (image.width % cellWidth !== 0 || image.height % cellHeight !== 0) {
    throw new Error(
      `Sheet ${image.width}x${image.height} is not an exact multiple of ` +
      `cell ${cellWidth}x${cellHeight}. Check the cell size.`
    );
  }
  const cols = image.width / cellWidth;
  const rows = image.height / cellHeight;
  const out = [];
  let n = 0;
  const pad = String(cols * rows).length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = image.crop(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
      const name = `${prefix}_${String(n).padStart(pad, '0')}`;
      n++;
      if (trim(cell).empty) continue;
      out.push({ name, image: cell });
    }
  }
  return out;
}

function loadSources(input, options) {
  if (input.toLowerCase().endsWith('.png')) {
    const sheet = Image.read(input);
    if (!options.cell) {
      throw new Error('A single PNG needs --cell WxH to say how to slice it.');
    }
    const [w, h] = options.cell;
    return sliceGrid(sheet, w, h, basename(input, extname(input)));
  }

  const files = readdirSync(input)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort(naturalCompare);
  if (files.length === 0) throw new Error(`No PNG files found in ${input}`);
  return files.map((f) => ({ name: basename(f, extname(f)), image: Image.read(join(input, f)) }));
}

/**
 * Trim, pack and export. Returns the manifest so tests and callers can inspect
 * the result without touching the filesystem layout.
 */
export function build(input, outDir, options = {}) {
  const {
    padding = 1,
    maxSize = 4096,
    powerOfTwo = false,
    noTrim = false,
    fps = 10,
    loop = true,
    atlasResources = false,
    name = 'atlas',
    resPath,
  } = options;

  const sources = loadSources(input, options);
  enforceLimit(sources.length);

  const rects = sources.map(({ name: spriteName, image }) => {
    const t = noTrim
      ? {
          x: 0, y: 0, width: image.width, height: image.height,
          sourceWidth: image.width, sourceHeight: image.height,
          margin: { left: 0, top: 0, right: 0, bottom: 0 },
        }
      : trim(image);
    return {
      name: spriteName,
      width: t.width,
      height: t.height,
      source: image,
      trim: t,
    };
  });

  const { width, height, placed } = pack(rects, { maxSize, padding, powerOfTwo });

  const atlas = new Image(width, height);
  const sprites = [];
  for (const p of placed) {
    const piece = p.source.crop(p.trim.x, p.trim.y, p.width, p.height);
    atlas.blit(piece, p.x, p.y);
    sprites.push({
      name: p.name,
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      margin: p.trim.margin,
      sourceWidth: p.trim.sourceWidth,
      sourceHeight: p.trim.sourceHeight,
    });
  }
  sprites.sort((a, b) => naturalCompare(a.name, b.name));

  mkdirSync(outDir, { recursive: true });
  const pngName = `${name}.png`;
  atlas.write(join(outDir, pngName));

  const texturePath = resPath ?? `res://${pngName}`;

  const usedArea = sprites.reduce((sum, s) => sum + s.width * s.height, 0);
  const manifest = {
    atlas: { image: pngName, width, height },
    padding,
    trimmed: !noTrim,
    efficiency: width * height > 0 ? usedArea / (width * height) : 0,
    sprites,
  };
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(
    join(outDir, `${name}_frames.tres`),
    spriteFramesTres(sprites, { texturePath, fps, loop })
  );

  if (atlasResources) {
    const dir = join(outDir, 'textures');
    mkdirSync(dir, { recursive: true });
    for (const sprite of sprites) {
      writeFileSync(join(dir, `${sprite.name}.tres`), atlasTextureTres(sprite, texturePath));
    }
  }

  return manifest;
}
