"""Vectorize logos + build glyph outlines -> shapes.json
Each shape: {id, group, color, d (svg path, absolute cubic), bbox}
"""
import json, sys
import numpy as np
from PIL import Image
import potrace
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROBOT_PNG, MERRY_PNG = sys.argv[1], sys.argv[2]
OUT = sys.argv[3]
GOLD = "#D3A132"
BLUE = "#0095DC"
GRAY = "#6A6B6E"


def trace_mask(mask, scale, ox, oy, turd=4, alphamax=1.0):
    """mask: bool array (True = ink). returns list of svg path strings (one per outer shape incl. holes)."""
    bmp = potrace.Bitmap(~mask)
    plist = bmp.trace(turdsize=turd, alphamax=alphamax, opticurve=True, opttolerance=0.2)
    T = lambda p: (ox + p.x * scale, oy + p.y * scale)
    # group curves: potrace gives a flat list; outer curves followed by holes. Use sign of area.
    shapes = []
    for curve in plist:
        sx, sy = T(curve.start_point)
        d = [f"M{sx:.2f},{sy:.2f}"]
        for seg in curve.segments:
            if seg.is_corner:
                cx, cy = T(seg.c); ex, ey = T(seg.end_point)
                d.append(f"L{cx:.2f},{cy:.2f}L{ex:.2f},{ey:.2f}")
            else:
                c1x, c1y = T(seg.c1); c2x, c2y = T(seg.c2); ex, ey = T(seg.end_point)
                d.append(f"C{c1x:.2f},{c1y:.2f} {c2x:.2f},{c2y:.2f} {ex:.2f},{ey:.2f}")
        d.append("Z")
        # signed area via polygon of segment end points
        pts = [T(curve.start_point)] + [T(s.end_point) for s in curve.segments]
        area = sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1] for i in range(len(pts) - 1))
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        shapes.append({"d": "".join(d), "area": area, "bbox": [min(xs), min(ys), max(xs), max(ys)]})
    # merge holes into containing outer shape (opposite sign area, bbox inside)
    if not shapes:
        return []
    outer_sign = np.sign(max(shapes, key=lambda s: abs(s["area"]))["area"])
    outers = [s for s in shapes if np.sign(s["area"]) == outer_sign]
    holes = [s for s in shapes if np.sign(s["area"]) != outer_sign]
    for h in holes:
        hb = h["bbox"]
        cands = [o for o in outers if o["bbox"][0] <= hb[0] and o["bbox"][1] <= hb[1] and o["bbox"][2] >= hb[2] and o["bbox"][3] >= hb[3]]
        if cands:
            o = min(cands, key=lambda o: (o["bbox"][2] - o["bbox"][0]) * (o["bbox"][3] - o["bbox"][1]))
            o["d"] += h["d"]
        else:
            outers.append(h)
    return [{"d": o["d"], "bbox": o["bbox"]} for o in outers]


def upscale_alpha(img, k):
    return img.resize((img.width * k, img.height * k), Image.LANCZOS)


shapes = []

# ---------- Robot logo (gold) ----------
robot = Image.open(ROBOT_PNG).convert("RGBA")
K = 3
r = np.array(upscale_alpha(robot, K)).astype(int)
mask = r[..., 3] > 128
# crop to bbox
ys, xs = np.nonzero(mask)
y0, x0 = ys.min(), xs.min()
crop = mask[y0:ys.max() + 1, x0:xs.max() + 1]
ROBOT_W = 520.0
s = ROBOT_W / crop.shape[1]
ROBOT_H = crop.shape[0] * s
for i, sh in enumerate(trace_mask(crop, s, 0, 0, turd=20)):
    shapes.append({"group": "robot", "color": GOLD, **sh})

# ---------- Merrycan wordmark (blue + gray R) ----------
mc = Image.open(MERRY_PNG).convert("RGBA")
K2 = 8
m = np.array(upscale_alpha(mc, K2)).astype(int)
rgb, al = m[..., :3], m[..., 3]
word_rows = slice(0, 42 * K2)
ink = al > 110
blue = ink & ((rgb[..., 2] - rgb[..., 0]) > 70)
gray = ink & ~blue
bw = np.zeros_like(blue); bw[word_rows] = blue[word_rows]
gw = np.zeros_like(gray); gw[word_rows] = gray[word_rows]
ys, xs = np.nonzero(bw | gw)
wy0, wx0, wy1, wx1 = ys.min(), xs.min(), ys.max(), xs.max()
MC_W = 720.0
s2 = MC_W / (wx1 - wx0 + 1)
for sh in trace_mask(bw[wy0:wy1 + 1, wx0:wx1 + 1], s2, 0, 0, turd=40, alphamax=0.9):
    shapes.append({"group": "merry", "color": BLUE, **sh})
for sh in trace_mask(gw[wy0:wy1 + 1, wx0:wx1 + 1], s2, 0, 0, turd=40, alphamax=0.9):
    shapes.append({"group": "merry", "color": GRAY, **sh})
WORD_H = (wy1 - wy0 + 1) * s2


# ---------- Font text helpers ----------
def text_shapes(font_path, text, x, baseline, size, color, group, tracking=0.0, width=None):
    f = TTFont(font_path, fontNumber=0)
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
    hmtx = f["hmtx"]
    names = [cmap[ord(ch)] for ch in text]
    adv = [hmtx[n][0] for n in names]
    total = sum(adv) + tracking * upm * (len(text) - 1)
    sc = size / upm
    if width:  # stretch tracking so the line spans `width`
        extra = (width / sc - sum(adv)) / max(1, len(text) - 1)
    else:
        extra = tracking * upm
    out = []
    cx = 0.0
    for ch, n, a in zip(text, names, adv):
        if ch != " ":
            sp = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}")
            tp = TransformPen(sp, (sc, 0, 0, -sc, x + cx * sc, baseline))
            gs[n].draw(tp)
            bp = BoundsPen(gs); gs[n].draw(bp)
            b = bp.bounds
            if b:
                bb = [x + (cx + b[0]) * sc, baseline - b[3] * sc, x + (cx + b[2]) * sc, baseline - b[1] * sc]
                out.append({"group": group, "color": color, "d": sp.getCommands(), "bbox": bb})
        cx += a + extra
    return out


FONTS = "/System/Library/Fonts/Supplemental"
# Merrycan: Chinese + English lines spanning wordmark width
cn = text_shapes(f"{FONTS}/Arial Unicode.ttf", "美立堅科技股份有限公司", 4, WORD_H + 92, 58, GRAY, "merry", width=MC_W - 8)
en = text_shapes(f"{FONTS}/Arial.ttf", "MERRYCAN TECHNOLOGY CO., LTD.", 4, WORD_H + 150, 40, GRAY, "merry", width=MC_W - 8)
shapes += cn + en
MC_H = WORD_H + 160

# TaiwanGoBoT text under robot (gold, rounded)
tg = text_shapes(f"{FONTS}/Arial Rounded Bold.ttf", "TaiwanGoBoT", 0, 0, 96, GOLD, "robotText", tracking=0.02)
tw = max(s["bbox"][2] for s in tg)
json.dump({"robot": {"w": ROBOT_W, "h": ROBOT_H}, "merry": {"w": MC_W, "h": MC_H},
           "text": {"w": tw, "h": 96}, "shapes": shapes + tg}, open(OUT, "w"))
print("robot", ROBOT_W, ROBOT_H, "merry", MC_W, MC_H, "text w", tw,
      {g: sum(1 for s in shapes + tg if s["group"] == g) for g in ["robot", "merry", "robotText"]})
