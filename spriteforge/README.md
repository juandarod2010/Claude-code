# SpriteForge

Turn a folder of PNGs into a packed atlas **and a Godot 4 `SpriteFrames`
resource you can drop straight onto an `AnimatedSprite2D`.**

No editor plugin, no account, no cloud upload. One command, runs offline.

```bash
node src/cli.js sprites/ -o assets/ -n hero
# Packed 24 sprites into 256x128 (91.4% used)
```

You get:

| File | What it is |
| --- | --- |
| `hero.png` | The packed atlas |
| `hero_frames.tres` | A Godot 4 `SpriteFrames` resource, animations already split |
| `hero.json` | Frame rectangles and trim margins, for any other engine |

Drop all three into your project, select your `AnimatedSprite2D`, and load
`hero_frames.tres` into its **Sprite Frames** property. That is the whole setup.

## Why the trim margins matter

Most quick-and-dirty packers trim the transparent border off each frame and
stop there. In Godot that makes every frame snap to its own tight bounds, and
your animation visibly jitters as the character's footing shifts frame to
frame.

SpriteForge writes Godot's `AtlasTexture.margin` so each frame reports its
**original** untrimmed size and draws at its original offset. You get the
memory savings of trimming with none of the wobble.

The margin arithmetic follows the engine source exactly — `AtlasTexture`
computes its size as `region.size + margin.size` and draws at
`position + margin.position`, so `margin.size` is the *total* trimmed amount
per axis, not the right/bottom edge. Getting that backwards is the single most
common way a hand-rolled exporter ends up subtly wrong.

## Install

Requires Node.js 18 or newer. Nothing else.

```bash
npm install
node src/cli.js --help
```

## Usage

```
spriteforge <input> [options]
```

`<input>` is either a folder of PNG files, or a single spritesheet PNG together
with `--cell WxH` to say how to slice it.

| Option | Default | What it does |
| --- | --- | --- |
| `-o, --out <dir>` | `./out` | Output folder |
| `-n, --name <name>` | `atlas` | Base name for the generated files |
| `--cell <WxH>` | — | Cell size when slicing a sheet, e.g. `--cell 32x32` |
| `--padding <px>` | `1` | Gap between sprites, to stop texture bleeding |
| `--max-size <px>` | `4096` | Largest atlas edge allowed |
| `--pot` | off | Force power-of-two atlas dimensions |
| `--no-trim` | off | Keep transparent borders |
| `--fps <n>` | `10` | Animation speed written into the resource |
| `--no-loop` | off | Mark animations as non-looping |
| `--atlas-resources` | off | Also write one `AtlasTexture.tres` per sprite |
| `--res-path <path>` | `res://<name>.png` | Where the atlas lives in your project |

### Animations are grouped by filename

A trailing frame number is stripped to form the animation name:

```
run_1.png  run_2.png  run_10.png   ->  animation "run", 3 frames, in order
idle_01.png idle_02.png            ->  animation "idle", 2 frames
chest.png                          ->  animation "chest", 1 frame
```

Frames sort numerically, so `run_10` correctly follows `run_2` instead of
landing between `run_1` and `run_2`.

### Slicing an existing spritesheet

```bash
node src/cli.js hero_sheet.png --cell 32x32 -o assets/
```

Fully transparent cells are dropped, so padded sheets do not produce empty
frames.

### Static sprites

For props and UI that are not animated, `--atlas-resources` writes a standalone
`AtlasTexture` per sprite under `out/textures/`. Assign one to a `Sprite2D`'s
**Texture** and it behaves like an ordinary image.

## Reproducible output

Packing is deterministic: the same sprites always produce a byte-identical
atlas, whatever order the files come back from the filesystem in. Atlases can
sit in version control without churning the diff on every build.

## Other engines

`<name>.json` lists every frame's region, trim margin and original size, so the
same atlas feeds Unity, Phaser, LÖVE or a custom renderer.

```json
{
  "atlas": { "image": "hero.png", "width": 256, "height": 128 },
  "sprites": [
    {
      "name": "run_1",
      "x": 0, "y": 0, "width": 20, "height": 18,
      "margin": { "left": 4, "top": 6, "right": 8, "bottom": 8 },
      "sourceWidth": 32, "sourceHeight": 32
    }
  ]
}
```

Note the JSON uses per-edge margins, which is what most engines expect. The
Godot `.tres` converts them to the engine's own convention for you.

## Tests

```bash
npm test
```

32 tests. The important one reconstructs every sprite pixel-for-pixel out of
the packed atlas using only the published region and margin, which is the same
arithmetic the engine performs — if that passes, what you see in Godot matches
what you put in.

## Limits

- PNG input only.
- One atlas per run; sprites that do not fit raise an error rather than
  silently spilling into a second page.
- Rotation is not used when packing.

## Licence

See `LICENSE.txt`. One developer, unlimited commercial projects, no royalties.
