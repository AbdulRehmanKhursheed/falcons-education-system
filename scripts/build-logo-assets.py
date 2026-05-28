#!/usr/bin/env python3
"""
Build the Falcons Education System logo asset bundle from a single source PNG.

Inputs
------
A raster crest PNG (any size, any background — transparency preserved).

Outputs (apps/portal/public/brand/)
----------------------------------
- crest.svg              — vector trace (color, splined). Scales to any size.
- crest@256.png          — 1x raster, square, padded.
- crest@512.png          — 2x raster.
- crest@1024.png         — 3x raster.
- crest@180-apple.png    — apple-touch-icon.
- crest-monogram@64.png  — small-format favicon (centered crop).
- og.png                 — 1200×630 OpenGraph card.

Outputs (apps/portal/app/)
--------------------------
- icon.png               — 256×256 favicon (Next.js convention).
- apple-icon.png         — 180×180 apple-touch-icon.

Outputs (apps/portal/public/)
-----------------------------
- logo.png               — alias of crest@512.png (back-compat for existing imports).

Why a script: keeps the asset pipeline reproducible. Re-run any time the source
crest is updated (`python3 scripts/build-logo-assets.py path/to/new.png`).
"""

from __future__ import annotations

import sys
from pathlib import Path

import vtracer
from PIL import Image, ImageDraw, ImageFont, ImageFilter

REPO = Path(__file__).resolve().parents[1]
PORTAL = REPO / "apps" / "portal"
BRAND_DIR = PORTAL / "public" / "brand"
PUBLIC = PORTAL / "public"
APP = PORTAL / "app"

NAVY = (22, 58, 117)
GOLD = (201, 160, 59)
PAPER = (250, 247, 241)


def ensure_dirs() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)


def load_source(path: Path) -> Image.Image:
    """Load source, normalise to RGBA, transparent-pad to a square."""
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2), img)
    return canvas


def upscale(img: Image.Image, target: int) -> Image.Image:
    """High-quality upscale (Lanczos) when target > current."""
    if img.width >= target:
        return img.resize((target, target), Image.LANCZOS)
    # Two-step upscale via 2x → softens the artefacts of a single jump.
    midpoint = min(target, img.width * 3)
    mid = img.resize((midpoint, midpoint), Image.LANCZOS)
    return mid.resize((target, target), Image.LANCZOS)


def vectorize(src: Path, dst: Path) -> None:
    """vtracer color trace with settings tuned for a heraldic crest."""
    vtracer.convert_image_to_svg_py(
        str(src),
        str(dst),
        colormode="color",
        hierarchical="stacked",
        mode="spline",          # smoother edges than polygon for gold laurels
        filter_speckle=4,       # drop noise smaller than 4px
        color_precision=8,      # finer palette = better gold tones
        layer_difference=16,
        corner_threshold=60,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=8,
    )


def emit_raster(img: Image.Image, size: int, out: Path) -> None:
    img.resize((size, size), Image.LANCZOS).save(out, "PNG", optimize=True)


def build_og_card(crest: Image.Image, out: Path) -> None:
    """1200×630 OpenGraph card: navy bg, gold rule, centered crest + wordmark."""
    W, H = 1200, 630
    card = Image.new("RGB", (W, H), NAVY)

    # subtle radial highlight — paint via a soft white circle blurred
    glow = Image.new("L", (W, H), 0)
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((W // 2 - 320, H // 2 - 320, W // 2 + 320, H // 2 + 320), fill=80)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    card.paste((40, 70, 130), (0, 0), glow)

    # gold hairline frame
    draw = ImageDraw.Draw(card)
    inset = 32
    draw.rectangle((inset, inset, W - inset, H - inset), outline=GOLD, width=2)

    # crest, centered
    crest_size = 320
    c = crest.resize((crest_size, crest_size), Image.LANCZOS)
    card.paste(c, ((W - crest_size) // 2, 90), c)

    # wordmark beneath
    text = "Falcons Education System"
    sub = "Rawalpindi · School Portal"
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 56)
        sub_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
    except OSError:
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()

    tw = draw.textlength(text, font=title_font)
    draw.text(((W - tw) // 2, 440), text, fill=PAPER, font=title_font)
    sw = draw.textlength(sub, font=sub_font)
    draw.text(((W - sw) // 2, 510), sub, fill=(232, 213, 153), font=sub_font)

    card.save(out, "PNG", optimize=True)


def main() -> None:
    src_arg = sys.argv[1] if len(sys.argv) > 1 else "/Users/malikabdul/Downloads/falcons-logo.png"
    src = Path(src_arg).expanduser().resolve()
    if not src.is_file():
        sys.exit(f"source not found: {src}")

    ensure_dirs()
    print(f"source: {src} ({Image.open(src).size})")

    # ── Vector ─────────────────────────────────────────────────────────
    svg_out = BRAND_DIR / "crest.svg"
    vectorize(src, svg_out)
    print(f"  ✓ {svg_out.relative_to(REPO)}  ({svg_out.stat().st_size // 1024} KB)")

    # ── Raster set ─────────────────────────────────────────────────────
    base = load_source(src)
    hires = upscale(base, 1024)

    raster_targets = {
        BRAND_DIR / "crest@256.png": 256,
        BRAND_DIR / "crest@512.png": 512,
        BRAND_DIR / "crest@1024.png": 1024,
        BRAND_DIR / "crest@180-apple.png": 180,
        BRAND_DIR / "crest-monogram@64.png": 64,
        APP / "icon.png": 256,
        APP / "apple-icon.png": 180,
        PUBLIC / "logo.png": 512,
    }

    for out, size in raster_targets.items():
        emit_raster(hires, size, out)
        print(f"  ✓ {out.relative_to(REPO)}  ({size}px)")

    # ── OG card ────────────────────────────────────────────────────────
    og_out = BRAND_DIR / "og.png"
    build_og_card(hires, og_out)
    print(f"  ✓ {og_out.relative_to(REPO)}  (1200×630)")

    print("done.")


if __name__ == "__main__":
    main()
