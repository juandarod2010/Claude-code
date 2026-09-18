/**
 * MaxRects bin packing with the best-short-side-fit heuristic.
 *
 * Input rects are sorted by descending max side (ties broken by name) so that a
 * given set of sprites always produces byte-identical output — reproducible
 * builds matter when the atlas is committed to a repository.
 */

function splitFree(free, used) {
  // No overlap: the free rect survives untouched.
  if (used.x >= free.x + free.width || used.x + used.width <= free.x ||
      used.y >= free.y + free.height || used.y + used.height <= free.y) {
    return [free];
  }

  const pieces = [];
  if (used.y > free.y) {
    pieces.push({ x: free.x, y: free.y, width: free.width, height: used.y - free.y });
  }
  if (used.y + used.height < free.y + free.height) {
    const y = used.y + used.height;
    pieces.push({ x: free.x, y, width: free.width, height: free.y + free.height - y });
  }
  if (used.x > free.x) {
    pieces.push({ x: free.x, y: free.y, width: used.x - free.x, height: free.height });
  }
  if (used.x + used.width < free.x + free.width) {
    const x = used.x + used.width;
    pieces.push({ x, y: free.y, width: free.x + free.width - x, height: free.height });
  }
  return pieces;
}

const contains = (a, b) =>
  b.x >= a.x && b.y >= a.y &&
  b.x + b.width <= a.x + a.width &&
  b.y + b.height <= a.y + a.height;

function pruneFree(list) {
  const kept = [];
  for (let i = 0; i < list.length; i++) {
    let redundant = false;
    for (let j = 0; j < list.length; j++) {
      if (i !== j && contains(list[j], list[i])) {
        // Identical rects would swallow each other; keep the first occurrence.
        if (!contains(list[i], list[j]) || j < i) { redundant = true; break; }
      }
    }
    if (!redundant) kept.push(list[i]);
  }
  return kept;
}

/**
 * Place every rect into a bin of the given size.
 * Returns null if any rect does not fit, so callers can grow and retry.
 */
export function packInto(rects, binWidth, binHeight, padding = 0) {
  let free = [{ x: 0, y: 0, width: binWidth, height: binHeight }];
  const placed = [];

  for (const rect of rects) {
    const w = rect.width + padding;
    const h = rect.height + padding;

    let best = null;
    let bestShort = Infinity;
    let bestLong = Infinity;

    for (const f of free) {
      if (f.width < w || f.height < h) continue;
      const leftoverH = f.width - w;
      const leftoverV = f.height - h;
      const shortSide = Math.min(leftoverH, leftoverV);
      const longSide = Math.max(leftoverH, leftoverV);
      if (shortSide < bestShort || (shortSide === bestShort && longSide < bestLong)) {
        best = { x: f.x, y: f.y, width: w, height: h };
        bestShort = shortSide;
        bestLong = longSide;
      }
    }

    if (!best) return null;

    free = pruneFree(free.flatMap((f) => splitFree(f, best)));
    placed.push({ ...rect, x: best.x, y: best.y });
  }

  return placed;
}

const nextPowerOfTwo = (n) => { let p = 1; while (p < n) p *= 2; return p; };

/**
 * Pack rects into the smallest bin that fits them, growing by doubling.
 * `powerOfTwo` constrains the final atlas to POT dimensions, which some
 * older mobile GPUs and compressed texture formats still require.
 */
export function pack(rects, { maxSize = 4096, padding = 1, powerOfTwo = false } = {}) {
  const sorted = [...rects].sort((a, b) => {
    const am = Math.max(a.width, a.height);
    const bm = Math.max(b.width, b.height);
    if (am !== bm) return bm - am;
    const an = Math.min(a.width, a.height);
    const bn = Math.min(b.width, b.height);
    if (an !== bn) return bn - an;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

  if (sorted.length === 0) return { width: 0, height: 0, placed: [] };

  const widest = Math.max(...sorted.map((r) => r.width + padding), 1);
  const tallest = Math.max(...sorted.map((r) => r.height + padding), 1);
  const area = sorted.reduce((sum, r) => sum + (r.width + padding) * (r.height + padding), 0);

  let width = Math.max(nextPowerOfTwo(widest), nextPowerOfTwo(Math.ceil(Math.sqrt(area))));
  let height = Math.max(nextPowerOfTwo(tallest), 1);

  while (width <= maxSize && height <= maxSize) {
    const placed = packInto(sorted, width, height, padding);
    if (placed) {
      if (powerOfTwo) return { width, height, placed };
      // Shrink to the actual occupied extent; POT atlases keep their bin size.
      const usedW = Math.max(...placed.map((p) => p.x + p.width));
      const usedH = Math.max(...placed.map((p) => p.y + p.height));
      return { width: usedW, height: usedH, placed };
    }
    // Grow the shorter axis first to stay close to square.
    if (width <= height) width *= 2; else height *= 2;
  }

  throw new Error(
    `Sprites do not fit in a ${maxSize}x${maxSize} atlas. ` +
    `Raise --max-size or split the input into several atlases.`
  );
}
