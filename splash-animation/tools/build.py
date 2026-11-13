"""shapes.json -> splash.json (Lottie) + static preview svg"""
import json, re, sys

src, out_dir = sys.argv[1], sys.argv[2]
D = json.load(open(src))
FPS = 60
W, H = 1080, 1200
TOTAL = 3.0
X_COLOR = "#9A9CA0"


def hex2rgb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [1]


# ---------- path parsing ----------
TOK = re.compile(r"[MLHVCQZmlhvcqz]|-?\d*\.?\d+(?:e-?\d+)?")


def parse(d):
    """returns list of subpaths; each: list of nodes [x,y,ix,iy,ox,oy] (tangents relative)"""
    toks = TOK.findall(d)
    i = 0; cmd = None; subs = []; cur = None; pos = (0, 0)

    def num():
        nonlocal i
        v = float(toks[i]); i += 1; return v

    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t; i += 1
            if cmd in "Zz":
                if cur:
                    # merge last node if equal to first
                    if len(cur) > 1 and abs(cur[-1][0] - cur[0][0]) < 1e-3 and abs(cur[-1][1] - cur[0][1]) < 1e-3:
                        cur[0][2], cur[0][3] = cur[-1][2], cur[-1][3]
                        cur.pop()
                    subs.append(cur); pos = (cur[0][0], cur[0][1]); cur = None
                continue
        if cmd == "M":
            x, y = num(), num(); cur = [[x, y, 0, 0, 0, 0]]; pos = (x, y); cmd = "L"
        elif cmd == "L":
            x, y = num(), num(); cur.append([x, y, 0, 0, 0, 0]); pos = (x, y)
        elif cmd == "H":
            x = num(); cur.append([x, pos[1], 0, 0, 0, 0]); pos = (x, pos[1])
        elif cmd == "V":
            y = num(); cur.append([pos[0], y, 0, 0, 0, 0]); pos = (pos[0], y)
        elif cmd == "C":
            c1x, c1y, c2x, c2y, x, y = [num() for _ in range(6)]
            p = cur[-1]; p[4], p[5] = c1x - p[0], c1y - p[1]
            cur.append([x, y, c2x - x, c2y - y, 0, 0]); pos = (x, y)
        elif cmd == "Q":
            qx, qy, x, y = [num() for _ in range(4)]
            p = cur[-1]; x0, y0 = p[0], p[1]
            c1 = (x0 + 2 / 3 * (qx - x0), y0 + 2 / 3 * (qy - y0))
            c2 = (x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y))
            p[4], p[5] = c1[0] - x0, c1[1] - y0
            cur.append([x, y, c2[0] - x, c2[1] - y, 0, 0]); pos = (x, y)
        else:
            raise ValueError(f"unsupported {cmd} in {d[:60]}")
    if cur:
        subs.append(cur)
    return subs


def lottie_path(sub, idx):
    r = lambda v: round(v, 2)
    return {"ty": "sh", "nm": f"p{idx}", "ind": idx, "ks": {"a": 0, "k": {
        "c": True,
        "v": [[r(n[0]), r(n[1])] for n in sub],
        "i": [[r(n[2]), r(n[3])] for n in sub],
        "o": [[r(n[4]), r(n[5])] for n in sub]}}}


EASE_O = {"x": [0.45], "y": [0]}
EASE_I = {"x": [0.25], "y": [1]}


def anim(t0, t1, v0, v1):
    f0, f1 = round(t0 * FPS), round(t1 * FPS)
    return {"a": 1, "k": [{"t": f0, "s": [v0], "o": EASE_O, "i": EASE_I}, {"t": f1, "s": [v1]}]}


def static(v):
    return {"a": 0, "k": v}


def tr():
    return {"ty": "tr", "p": static([0, 0]), "a": static([0, 0]), "s": static([100, 100]),
            "r": static(0), "o": static(100), "sk": static(0), "sa": static(0)}


def shape_group(sh, idx, draw0, draw1, fill0, fill1, stroke_w, from_right=False):
    subs = parse(sh["d"])
    # pen starts at the leftmost (or rightmost) node of every contour
    pick = max if from_right else min
    subs = [s[s.index(pick(s, key=lambda n: n[0])):] + s[:s.index(pick(s, key=lambda n: n[0]))] for s in subs]
    col = hex2rgb(sh["color"])
    items = [lottie_path(s, k) for k, s in enumerate(subs)]
    # grow the stroke both ways from the start point: segment [o, o+e] with o = -e/2
    items.append({"ty": "tm", "nm": "trim", "s": static(0), "e": anim(draw0, draw1, 0, 100),
                  "o": anim(draw0, draw1, 0, -180), "m": 1})
    items.append({"ty": "st", "nm": "stroke", "c": static(col), "o": anim(fill0 + 0.15, fill1 + 0.1, 100, 0),
                  "w": static(stroke_w), "lc": 2, "lj": 2})
    items.append({"ty": "fl", "nm": "fill", "c": static(col), "o": anim(fill0, fill1, 0, 100), "r": 1})
    items.append(tr())
    return {"ty": "gr", "nm": f"s{idx}", "it": items}


def layer(name, ind, groups, pos, scale):
    return {"ddd": 0, "ind": ind, "ty": 4, "nm": name, "sr": 1, "ip": 0, "op": TOTAL * FPS, "st": 0, "bm": 0,
            "ks": {"o": static(100), "r": static(0), "p": static(pos + [0]), "a": static([0, 0, 0]),
                   "s": static([scale * 100, scale * 100, 100])},
            "shapes": groups}


def staggered(shapes, order_key, reverse, t_start, t_spread, dur, fill0, fill1, stroke_w):
    shapes = sorted(shapes, key=order_key, reverse=reverse)
    xs = [order_key(s) for s in shapes]
    lo, hi = min(xs), max(xs)
    out = []
    for k, s in enumerate(shapes):
        frac = abs(order_key(s) - (hi if reverse else lo)) / max(1e-6, hi - lo)
        t0 = t_start + frac * t_spread
        out.append(shape_group(s, k, t0, t0 + dur, fill0, fill1, stroke_w, from_right=reverse))
    return out


S = D["shapes"]
robot = [s for s in S if s["group"] == "robot"]
text = [s for s in S if s["group"] == "robotText"]
merry = [s for s in S if s["group"] == "merry"]

# ---------- layout ----------
ROBOT_SC = 380 / D["robot"]["h"]
rw = D["robot"]["w"] * ROBOT_SC
TEXT_SC = 470 / D["text"]["w"]
MERRY_SC = 560 / D["merry"]["w"]
mh = D["merry"]["h"] * MERRY_SC
y = 70
robot_pos = [(W - rw) / 2, y]; y += 380 + 40
text_base = y + 96 * 0.72 * TEXT_SC  # baseline (text built at baseline 0)
text_pos = [(W - 470) / 2, text_base]; y = text_base + 20 * TEXT_SC + 60
X_SIZE = 70
x_center = [W / 2, y + X_SIZE / 2]; y += X_SIZE + 70
merry_pos = [(W - 560) / 2, y]; y += mh
print("content bottom", y)

xmin = lambda s: s["bbox"][0]
xmax = lambda s: s["bbox"][2]
layers = []
# Robot: left -> right
layers.append(layer("TaiwanGoBoT logo", 1,
                    staggered(robot, xmin, False, 0.0, 0.7, 1.0, 1.45, 1.95, 2.2 / ROBOT_SC), robot_pos, ROBOT_SC))
layers.append(layer("TaiwanGoBoT text", 2,
                    staggered(text, xmin, False, 0.45, 0.65, 0.7, 1.6, 2.05, 2.0 / TEXT_SC), text_pos, TEXT_SC))
# Merrycan: right -> left
layers.append(layer("Merrycan logo", 3,
                    staggered(merry, xmax, True, 0.0, 0.9, 0.9, 1.45, 1.95, 1.6 / MERRY_SC), merry_pos, MERRY_SC))

# X mark: two strokes, drawn after logos meet
h = X_SIZE / 2
def line(x0, y0, x1, y1, t0, t1, nm):
    return {"ty": "gr", "nm": nm, "it": [
        {"ty": "sh", "ks": static({"c": False, "v": [[x0, y0], [x1, y1]], "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]]})},
        {"ty": "tm", "s": static(0), "e": anim(t0, t1, 0, 100), "o": static(0), "m": 1},
        {"ty": "st", "c": static(hex2rgb(X_COLOR)), "o": static(100), "w": static(5), "lc": 2, "lj": 2},
        tr()]}
xl = layer("X mark", 4, [line(-h, -h, h, h, 1.35, 1.7, "a"), line(h, -h, -h, h, 1.55, 1.9, "b")], x_center, 1)
xl["ks"]["s"] = {"a": 1, "k": [{"t": round(1.35 * FPS), "s": [80, 80, 100], "o": EASE_O, "i": EASE_I},
                              {"t": round(2.0 * FPS), "s": [100, 100, 100]}]}
layers.insert(0, xl)

lottie = {"v": "5.9.0", "fr": FPS, "ip": 0, "op": TOTAL * FPS, "w": W, "h": H, "nm": "TaiwanGoBoT x Merrycan splash",
          "ddd": 0, "assets": [], "layers": layers}
json.dump(lottie, open(f"{out_dir}/splash.json", "w"), separators=(",", ":"))

# static svg (final frame) for sanity check / fallback
def g(shs, pos, sc):
    return f'<g transform="translate({pos[0]:.1f},{pos[1]:.1f}) scale({sc:.4f})">' + "".join(
        f'<path fill="{s["color"]}" fill-rule="nonzero" d="{s["d"]}"/>' for s in shs) + "</g>"
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><rect width="100%" height="100%" fill="#fff"/>'
       + g(robot, robot_pos, ROBOT_SC) + g(text, text_pos, TEXT_SC) + g(merry, merry_pos, MERRY_SC)
       + f'<g stroke="{X_COLOR}" stroke-width="5" stroke-linecap="round" transform="translate({x_center[0]},{x_center[1]})">'
         f'<line x1="{-h}" y1="{-h}" x2="{h}" y2="{h}"/><line x1="{h}" y1="{-h}" x2="{-h}" y2="{h}"/></g></svg>')
open(f"{out_dir}/splash-final.svg", "w").write(svg)
print("ok", len(json.dumps(lottie)) // 1024, "KB")
