#!/usr/bin/env python3
"""
build.py — bundle the split source (src/index.html + assets/ + data/) into a single
self-contained index.html at the repo root, suitable for single-file deployment
(e.g. copying one index.html into the 0xsh4n.github.io repo).

Source of truth stays split:
  src/index.html        — the page shell / template (references assets + data)
  assets/css/style.css  — styles
  assets/js/app.js      — application logic
  data/*.js             — one module per file (plus _registry.js)

Run:  python3 build.py      ->  writes ./index.html (inlined, no local deps)

The external Google Fonts <link> tags are left as-is (allowed remote resource).
Any "</script>" inside inlined JS (e.g. payload strings) is escaped to "<\\/script>"
so it cannot prematurely close the inlined <script> block.
"""
import re, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(ROOT, "src", "index.html")
OUT = os.path.join(ROOT, "index.html")

def read(p):
    with open(os.path.join(ROOT, p), "r", encoding="utf-8") as f:
        return f.read()

def esc_js(js):
    # prevent a literal </script> inside JS strings from closing the inlined tag
    return re.sub(r"</(script)", r"<\\/\1", js, flags=re.I)

def main():
    if not os.path.exists(TEMPLATE):
        sys.exit("missing src/index.html (template)")
    html = read(os.path.join("src", "index.html"))

    # 1) inline the stylesheet
    css = read(os.path.join("assets", "css", "style.css"))
    html = re.sub(
        r'<link[^>]+href="assets/css/style\.css"[^>]*>',
        "<style>\n" + css + "\n</style>",
        html, count=1)

    # 2) inline every local <script src="..."></script> in document order,
    #    preserving the order they appear in the template.
    script_re = re.compile(r'<script\s+src="([^"]+)"></script>')
    def repl(m):
        src = m.group(1)
        if src.startswith("http"):   # leave remote scripts alone
            return m.group(0)
        path = src.lstrip("/")
        if not os.path.exists(os.path.join(ROOT, path)):
            sys.exit("referenced script not found: " + src)
        return "<script>\n" + esc_js(read(path)) + "\n</script>"
    html = script_re.sub(repl, html)

    # sanity: no local refs remain
    leftovers = re.findall(r'(?:src|href)="(?:assets/|data/)[^"]+"', html)
    if leftovers:
        sys.exit("unbundled local references remain: " + ", ".join(sorted(set(leftovers))))

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    kb = os.path.getsize(OUT) / 1024
    print("built -> index.html  (%.0f KB, self-contained)" % kb)

if __name__ == "__main__":
    main()
