#!/usr/bin/env node
import { build } from './build.js';

const USAGE = `spriteforge - trim, pack and export sprite atlases for Godot 4

  spriteforge <input> [options]

  <input>   A folder of PNG files, or a single spritesheet PNG (needs --cell).

Options:
  -o, --out <dir>       Output folder                      (default: ./out)
  -n, --name <name>     Base name for generated files      (default: atlas)
      --cell <WxH>      Cell size when slicing a sheet     (e.g. --cell 32x32)
      --padding <px>    Gap between packed sprites         (default: 1)
      --max-size <px>   Largest atlas edge allowed         (default: 4096)
      --pot             Force power-of-two atlas dimensions
      --no-trim         Keep transparent borders
      --fps <n>         Animation speed in the resource    (default: 10)
      --no-loop         Mark animations as non-looping
      --atlas-resources Also write one AtlasTexture .tres per sprite
      --res-path <path> res:// path of the atlas inside your project
  -h, --help            Show this message

Output:
  <name>.png            The packed atlas
  <name>.json           Frame rectangles and trim margins
  <name>_frames.tres    A Godot 4 SpriteFrames resource
`;

function parseArgs(argv) {
  const options = {};
  let input = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${arg} needs a value.`);
      return v;
    };
    switch (arg) {
      case '-h': case '--help': options.help = true; break;
      case '-o': case '--out': options.out = value(); break;
      case '-n': case '--name': options.name = value(); break;
      case '--padding': options.padding = Number(value()); break;
      case '--max-size': options.maxSize = Number(value()); break;
      case '--pot': options.powerOfTwo = true; break;
      case '--no-trim': options.noTrim = true; break;
      case '--fps': options.fps = Number(value()); break;
      case '--no-loop': options.loop = false; break;
      case '--atlas-resources': options.atlasResources = true; break;
      case '--res-path': options.resPath = value(); break;
      case '--cell': {
        const m = value().match(/^(\d+)[xX](\d+)$/);
        if (!m) throw new Error('--cell expects WxH, for example --cell 32x32.');
        options.cell = [Number(m[1]), Number(m[2])];
        break;
      }
      default:
        if (arg.startsWith('-')) throw new Error(`Unknown option ${arg}. Try --help.`);
        if (input !== null) throw new Error('Only one input path is accepted.');
        input = arg;
    }
  }

  for (const key of ['padding', 'maxSize', 'fps']) {
    if (options[key] !== undefined && !Number.isFinite(options[key])) {
      throw new Error(`--${key} must be a number.`);
    }
  }
  return { input, options };
}

export function main(argv) {
  const { input, options } = parseArgs(argv);
  if (options.help || input === null) {
    process.stdout.write(USAGE);
    return options.help ? 0 : 1;
  }

  const manifest = build(input, options.out ?? 'out', options);
  const percent = (manifest.efficiency * 100).toFixed(1);
  process.stdout.write(
    `Packed ${manifest.sprites.length} sprites into ` +
    `${manifest.atlas.width}x${manifest.atlas.height} (${percent}% used)\n`
  );
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`error: ${error.message}\n`);
    process.exit(1);
  }
}
