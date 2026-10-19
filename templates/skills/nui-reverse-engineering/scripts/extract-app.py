"""Isolate the application code from a built NUI bundle (webpack/vite, Vue or React) and map its NUI contract.

Usage:
    python -I extract-app.py <web-side folder or bundle.js> <out-dir>

Writes to <out-dir>:
    app.js      beautified app code (framework runtime stripped as far as possible)
    full.js     beautified full bundle (fallback when the cut is wrong)
    *.css       beautified stylesheets
    report.md   NUI callbacks, message actions, components, routes, CSS vars, root font-size

Requires Node (uses `npx js-beautify`).
"""

import os
import re
import subprocess
import sys

APP_MARKERS = [
    "GetParentResourceName",
    'addEventListener("message"',
    "addEventListener('message'",
    '__name:"',
    "__name: \"",
]
CUT_MARGIN = 12000


def beautify(source_path: str, out_path: str, kind: str = "js") -> None:
    command = f'npx --yes js-beautify@1.15.1 --type {kind} "{source_path}"'
    result = subprocess.run(command, shell=True, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        sys.exit(f"js-beautify failed on {source_path}:\n{result.stderr}")
    with open(out_path, "w", encoding="utf-8") as handle:
        handle.write(result.stdout)


def find_files(target: str) -> tuple[list[str], list[str]]:
    if os.path.isfile(target):
        return [target], []

    scripts, styles = [], []
    for root, _, files in os.walk(target):
        for name in files:
            path = os.path.join(root, name)
            if name.endswith(".js"):
                scripts.append(path)
            elif name.endswith(".css"):
                styles.append(path)
    return scripts, styles


def cut_app(source: str) -> str:
    positions = [source.find(marker) for marker in APP_MARKERS]
    positions = [position for position in positions if position >= 0]
    if not positions:
        return source
    start = max(0, min(positions) - CUT_MARGIN)
    return source[start:]


def unique(items: list[str]) -> list[str]:
    seen, ordered = set(), []
    for item in items:
        if item not in seen:
            seen.add(item)
            ordered.append(item)
    return ordered


def build_report(app: str, css: str) -> str:
    callbacks = re.findall(r'call\(\s*"([A-Za-z0-9_]+)"', app)
    callbacks += re.findall(r'(?:post|fetchNui|Post\.create)\(\s*"([A-Za-z0-9_]+)"', app)
    concat_targets = re.findall(r'GetParentResourceName\(\)[^;]{0,80}?"/"\)?\.concat\(\s*"?([A-Za-z0-9_]+)', app)
    actions = re.findall(r'"([A-Za-z0-9_]+)"\s*===\s*\w+\.(?:Action|action)', app)
    actions += re.findall(r'\.(?:Action|action)\s*===\s*"([A-Za-z0-9_]+)"', app)
    components = re.findall(r'__name:\s*"([^"]+)"', app)
    routes = re.findall(r'path:\s*"([^"]*)",\s*name:\s*"([^"]+)"', app)
    stores = re.findall(r'\w+\(\s*"([a-zA-Z0-9_-]+)",\s*\{\s*state:', app)
    keys = re.findall(r'"([A-Za-z]|Escape|Enter|Backspace|Arrow\w+)"\s*===\s*\w+\.key', app)
    css_vars = re.findall(r"var\((--[a-zA-Z0-9-]+)", css)
    root_sizes = re.findall(r"(@media[^{]+)\{\s*:root\s*\{\s*font-size:\s*([^;}]+)", css)

    lines = ["# Bundle report", ""]
    lines += ["## NUI callbacks (NUI -> Lua)", ""]
    lines += [f"- `{name}`" for name in unique(callbacks + concat_targets) if len(name) > 1] or ["- none found, grep `https://` in app.js"]
    lines += ["", "## Message actions (Lua -> NUI)", ""]
    lines += [f"- `{name}`" for name in unique(actions)] or ["- none found, grep `addEventListener` and `switch` in app.js"]
    lines += ["", "## Stores", ""] + ([f"- `{name}`" for name in unique(stores)] or ["- none"])
    lines += ["", "## Components", ""] + ([f"- `{name}`" for name in unique(components)] or ["- none (React or anonymous)"])
    lines += ["", "## Routes", ""] + ([f"- `{path or '/'}` -> `{name}`" for path, name in routes] or ["- none"])
    lines += ["", "## Keyboard keys", ""] + ([f"- `{key}`" for key in unique(keys)] or ["- none"])
    lines += ["", "## CSS variables used", ""] + ([f"- `{name}`" for name in unique(css_vars)] or ["- none"])
    lines += ["", "## Root font-size breakpoints", ""]
    lines += [f"- `{media.strip()}` -> `{size.strip()}`" for media, size in root_sizes] or ["- none"]
    return "\n".join(lines) + "\n"


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)

    target, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    scripts, styles = find_files(target)
    if not scripts:
        sys.exit(f"No .js file found in {target}")

    bundle = max(scripts, key=os.path.getsize)
    with open(bundle, encoding="utf-8", errors="replace") as handle:
        source = handle.read()

    minified_app = os.path.join(out_dir, "app.min.js")
    with open(minified_app, "w", encoding="utf-8") as handle:
        handle.write(cut_app(source))

    beautify(bundle, os.path.join(out_dir, "full.js"))
    beautify(minified_app, os.path.join(out_dir, "app.js"))
    os.remove(minified_app)

    css = ""
    for style in styles:
        out_css = os.path.join(out_dir, os.path.basename(style))
        beautify(style, out_css, "css")
        with open(out_css, encoding="utf-8") as handle:
            css += handle.read()

    with open(os.path.join(out_dir, "app.js"), encoding="utf-8") as handle:
        app = handle.read()

    with open(os.path.join(out_dir, "report.md"), "w", encoding="utf-8") as handle:
        handle.write(build_report(app, css))

    print(f"bundle: {bundle}")
    print(f"out: {out_dir} (app.js, full.js, css, report.md)")


if __name__ == "__main__":
    main()
