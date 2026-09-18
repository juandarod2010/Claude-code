/**
 * Find the tightest rectangle containing every pixel with alpha > threshold.
 *
 * Returns the source rect plus the margins that were cut away, which is what a
 * consumer needs to place the trimmed pixels back at their original offset.
 * A fully transparent image yields a 1x1 rect so that downstream packing and
 * engine resources stay valid instead of producing a zero-sized texture.
 */
export function trim(image, threshold = 0) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (image.alphaAt(x, y) > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    return {
      empty: true,
      x: 0, y: 0, width: 1, height: 1,
      sourceWidth: image.width,
      sourceHeight: image.height,
      margin: { left: 0, top: 0, right: Math.max(0, image.width - 1), bottom: Math.max(0, image.height - 1) },
    };
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  return {
    empty: false,
    x: minX,
    y: minY,
    width,
    height,
    sourceWidth: image.width,
    sourceHeight: image.height,
    margin: {
      left: minX,
      top: minY,
      right: image.width - width - minX,
      bottom: image.height - height - minY,
    },
  };
}
