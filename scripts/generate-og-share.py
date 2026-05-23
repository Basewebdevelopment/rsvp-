#!/usr/bin/env python3
"""Build the 1200x630 Open Graph image from the couple portrait."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "couple-bg.png"
OUT = ROOT / "public" / "images" / "og-share.png"
TARGET_W, TARGET_H = 1200, 630
TEXT_PAD_X = 48
LINE_GAP = 10


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/Library/Fonts/Arial.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int]:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.ImageFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []

    for word in words:
        candidate = " ".join([*current, word])
        width, _ = text_size(draw, candidate, font)
        if width <= max_width or not current:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]

    if current:
        lines.append(" ".join(current))
    return lines


def crop_for_faces(img: Image.Image) -> Image.Image:
    """Cover-crop portrait source from the top so faces stay in frame."""
    src_w, src_h = img.size
    scale = max(TARGET_W / src_w, TARGET_H / src_h)
    new_w = int(src_w * scale)
    new_h = int(src_h * scale)
    scaled = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    left = (new_w - TARGET_W) // 2
    top = max(0, int((new_h - TARGET_H) * 0.04))
    return scaled.crop((left, top, left + TARGET_W, top + TARGET_H))


def add_text_overlay(img: Image.Image) -> Image.Image:
    base = img.convert("RGBA")
    overlay = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    title_font = load_font(38)
    body_font = load_font(24)
    small_font = load_font(20)
    max_text_width = TARGET_W - (TEXT_PAD_X * 2)

    blocks: list[tuple[str, ImageFont.ImageFont]] = []
    blocks.append(("Seating Plan", title_font))
    for line in wrap_text(
        draw,
        "Navigate here to find the seat you'll be sitting at",
        body_font,
        max_text_width,
    ):
        blocks.append((line, body_font))
    blocks.append(("Edmond & Claudia · 08 August 2026", small_font))

    total_text_h = 0
    measured: list[tuple[str, ImageFont.ImageFont, int]] = []
    for text, font in blocks:
        _, height = text_size(draw, text, font)
        measured.append((text, font, height))
        total_text_h += height
    total_text_h += LINE_GAP * (len(measured) - 1)

    bar_pad_y = 22
    bar_h = total_text_h + (bar_pad_y * 2)
    bar_top = TARGET_H - bar_h

    for y in range(bar_h):
        alpha = min(230, int(180 + (y / bar_h) * 50))
        draw.line([(0, bar_top + y), (TARGET_W, bar_top + y)], fill=(28, 22, 16, alpha))

    y = bar_top + bar_pad_y
    for index, (text, font, height) in enumerate(measured):
        draw.text((TARGET_W // 2, y), text, font=font, fill=(255, 252, 247, 255), anchor="ma")
        y += height
        if index < len(measured) - 1:
            y += LINE_GAP

    return Image.alpha_composite(base, overlay).convert("RGB")


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source image: {SRC}")

    photo = Image.open(SRC).convert("RGB")
    framed = crop_for_faces(photo)
    final = add_text_overlay(framed)
    final.save(OUT, format="PNG", optimize=True)
    print(f"Wrote {OUT} ({TARGET_W}x{TARGET_H})")


if __name__ == "__main__":
    main()
