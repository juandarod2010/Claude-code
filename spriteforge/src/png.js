import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

/** An RGBA8 image. `data` is width*height*4 bytes, row-major, non-premultiplied. */
export class Image {
  constructor(width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data ?? Buffer.alloc(width * height * 4);
  }

  static read(path) {
    const png = PNG.sync.read(readFileSync(path));
    return new Image(png.width, png.height, png.data);
  }

  write(path) {
    const png = new PNG({ width: this.width, height: this.height });
    this.data.copy(png.data);
    writeFileSync(path, PNG.sync.write(png));
  }

  alphaAt(x, y) {
    return this.data[(y * this.width + x) * 4 + 3];
  }

  /** Copy a sub-rectangle into a new image. */
  crop(x, y, w, h) {
    const out = new Image(w, h);
    for (let row = 0; row < h; row++) {
      const from = ((y + row) * this.width + x) * 4;
      this.data.copy(out.data, row * w * 4, from, from + w * 4);
    }
    return out;
  }

  /** Blit `src` so its top-left lands at (x, y). Straight copy, no blending. */
  blit(src, x, y) {
    if (x < 0 || y < 0 || x + src.width > this.width || y + src.height > this.height) {
      throw new RangeError(
        `blit of ${src.width}x${src.height} at (${x}, ${y}) falls outside ` +
        `a ${this.width}x${this.height} image`
      );
    }
    for (let row = 0; row < src.height; row++) {
      const to = ((y + row) * this.width + x) * 4;
      src.data.copy(this.data, to, row * src.width * 4, (row + 1) * src.width * 4);
    }
  }
}
