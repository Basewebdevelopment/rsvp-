#!/usr/bin/env python3
"""Build the 1200x630 Open Graph image from the couple portrait."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "couple-bg.png"
OUT = ROOT / "public" / "images" / "og-share.png"
TARGET_W, TARGET_H = 1200, 630
BG_COLOR = (250, 247, 242)
TEXT_PAD_X = 48
LINE_GAP = 8


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


def measure_text_block(draw: ImageDraw.ImageDraw) -> tuple[list[tuple[str, ImageFont.ImageFont, int, tuple[int, int, int]]], int]:
    title_font = load_font(34)
    body_font = load_font(22)
    small_font = load_font(19)
    max_text_width = TARGET_W - (TEXT_PAD_X * 2)

    blocks: list[tuple[str, ImageFont.ImageFont, tuple[int, int, int]]] = [
        ("Seating Plan", title_font, (44, 36, 24)),
    ]
    for line in wrap_text(
        draw,
        "Navigate here to find the seat you'll be sitting at",
        body_font,
        max_text_width,
    ):
        blocks.append((line, body_font, (107, 93, 74)))
    blocks.append(("Edmond & Claudia · 08 August 2026", small_font, (138, 121, 98)))

    measured: list[tuple[str, ImageFont.ImageFont, int, tuple[int, int, int]]] = []
    total_h = 0
    for text, font, color in blocks:
        _, height = text_size(draw, text, font)
        measured.append((text, font, height, color))
        total_h += height
    total_h += LINE_GAP * (len(measured) - 1)
    return measured, total_h


def fit_entire_photo(img: Image.Image, photo_area_h: int) -> Image.Image:
    """Scale the full portrait to fit inside the photo area without cropping."""
    src_w, src_h = img.size
    scale = min(TARGET_W / src_w, photo_area_h / src_h)
    new_w = max(1, int(src_w * scale))
    new_h = max(1, int(src_h * scale))
    return img.resize((new_w, new_h), Image.Resampling.LANCZOS)


def build_share_image(photo: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    measured, text_block_h = measure_text_block(draw)
    bar_pad_y = 18
    bar_h = text_block_h + (bar_pad_y * 2)
    photo_area_h = TARGET_H - bar_h

    fitted = fit_entire_photo(photo, photo_area_h)
    photo_x = (TARGET_W - fitted.width) // 2
    photo_y = (photo_area_h - fitted.height) // 2
    canvas.paste(fitted, (photo_x, photo_y))

    bar_top = photo_area_h
    draw.rectangle([(0, bar_top), (TARGET_W, TARGET_H)], fill=(244, 239, 232))
    draw.line([(0, bar_top), (TARGET_W, bar_top)], fill=(196, 180, 154), width=1)

    y = bar_top + bar_pad_y
    for index, (text, font, height, color) in enumerate(measured):
        draw.text((TARGET_W // 2, y), text, font=font, fill=color, anchor="ma")
        y += height
        if index < len(measured) - 1:
            y += LINE_GAP

    return canvas


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source image: {SRC}")

    photo = Image.open(SRC).convert("RGB")
    final = build_share_image(photo)
    final.save(OUT, format="PNG", optimize=True)
    print(f"Wrote {OUT} ({TARGET_W}x{TARGET_H})")


if __name__ == "__main__":
    main()
