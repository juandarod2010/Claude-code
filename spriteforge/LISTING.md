# itch.io listing — copy/paste

Everything below is ready to paste. Nothing here claims anything that the
product does not actually do.

---

## Title

```
SpriteForge — Godot 4 sprite atlas packer
```

## Short description (max ~120 chars)

```
Pack PNGs into an atlas and get a ready-to-use Godot 4 SpriteFrames resource. One command, offline, no plugin.
```

## Classification / settings

| Field | Value |
| --- | --- |
| Kind of project | **Tool** |
| Release status | Released |
| Pricing | **Paid, $9 minimum** |
| Uploads | `spriteforge-1.0.0.zip` (paid) and `spriteforge-free-1.0.0.zip` (free demo) |
| Platforms | Windows, macOS, Linux (tick all three — it is Node.js, it runs everywhere) |

Mark the free ZIP as a **demo** so it is downloadable without paying. That free
download is what gets the page ranked; the paid ZIP is what earns.

## Tags

```
godot, godot4, spritesheet, texture-atlas, gamedev, 2d, sprites, pixel-art, tool, cli
```

## AI disclosure — REQUIRED, do not skip

itch.io requires every project that used generative AI to carry the
**`AI Generated`** tag, even when the output was reviewed and edited by hand.
This tool was written with AI assistance, so **tick the AI generated content
box and add the tag.**

This is not optional cover-your-back advice: an untagged project that used AI
gets de-indexed, which means it stops appearing in search and browse — the
exact thing the whole plan depends on. Tagging it honestly costs nothing.

Suggested disclosure line for the page body (already included below):

> Written with AI assistance and reviewed by hand. The packing and Godot export
> behaviour is covered by 32 automated tests, including a pixel-for-pixel
> round-trip check against the engine's own margin arithmetic.

---

## Page body

```
Turn a folder of PNGs into a packed atlas AND a Godot 4 SpriteFrames resource
you can drop straight onto an AnimatedSprite2D.

    node src/cli.js sprites/ -o assets/ -n hero
    Packed 24 sprites into 256x128 (91.4% used)

You get three files:

  hero.png           the packed atlas
  hero_frames.tres   a Godot 4 SpriteFrames resource, animations already split
  hero.json          frame rectangles and trim margins, for any other engine

Drop them into your project, select your AnimatedSprite2D, load
hero_frames.tres into its Sprite Frames property. That is the whole setup.


WHY THE TRIM MARGINS MATTER

Most quick packers trim the transparent border off each frame and stop there.
In Godot that makes every frame snap to its own tight bounds, and your
animation visibly jitters as the character's footing shifts frame to frame.

SpriteForge writes Godot's AtlasTexture.margin so each frame reports its
ORIGINAL untrimmed size and draws at its original offset. You get the memory
savings of trimming with none of the wobble.

The margin arithmetic follows the engine source exactly: AtlasTexture computes
its size as region.size + margin.size and draws at position + margin.position,
so margin.size is the TOTAL trimmed amount per axis, not the right/bottom edge.
Getting that backwards is the most common way a hand-rolled exporter ends up
subtly wrong, and it is why this exists.


WHAT IT DOES

  - Trims transparent borders, with correct Godot margins
  - Packs with MaxRects, typically 85-95% area used
  - Groups animations from filenames: run_1, run_2, run_10 becomes "run",
    in the right order (run_10 follows run_2, not run_1)
  - Slices an existing spritesheet with --cell 32x32
  - Writes standalone AtlasTexture resources for static props
  - Power-of-two atlases with --pot
  - Deterministic output: the same sprites always produce a byte-identical
    atlas, so it will not churn your git diff


REQUIREMENTS

Node.js 18 or newer. Nothing else. No editor plugin, no account, no cloud
upload, no telemetry. It reads your PNGs and writes your output folder, and it
works with the network off.


FREE EDITION

The free download is the same tool, capped at 12 sprites per atlas. Try it on a
real character before you pay for anything.


LICENCE

One developer, unlimited commercial projects, no royalties, no revenue cap.
The atlases it generates are yours. Full terms in LICENSE.txt.


Written with AI assistance and reviewed by hand. The packing and Godot export
behaviour is covered by 32 automated tests, including a pixel-for-pixel
round-trip check against the engine's own margin arithmetic.
```

---

## Before you publish — the one thing worth doing

Open Godot 4, make an empty project, drop in `examples/` output and load
`hero_frames.tres` onto an `AnimatedSprite2D`. Confirm the animation plays and
does not jitter.

The margin arithmetic is verified against the engine source and covered by
tests, but nobody here has opened the file in Godot itself. Five minutes of
your time turns "should work" into "does work", and it is the difference
between a sale and a refund.
