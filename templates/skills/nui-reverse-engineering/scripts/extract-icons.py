"""Turn the inline SVG components of a beautified Vue bundle into a React Icons.tsx.

Usage:
    python -I extract-icons.py <app.js> <out Icons.tsx>

Each icon is named Icon<N>_<sourceVar>; rename them after checking where each one is used.
Mingcute-style bounding-box paths (d="M24 0v24H0V0h24Z...") are dropped: inside a fill="none" <g>
they were invisible, flattened they would render as a filled square.
"""

import re
import sys

SVG_RENDER = re.compile(
    r'(?P<name>\w+)\s*=\s*\(0,\s*\w+\.\w+\)\(\w+,\s*\[\s*\["render",\s*function\(e,\s*t\)\s*\{\s*'
    r'return\s+\w+\(\),\s*\w+\("svg",\s*\w+\(\{(?P<attrs>.*?)\},\s*e\.\$props\),\s*(?P<children>\w+),',
    re.S,
)
ELEMENT = re.compile(r'\w+\("(path|polygon|circle|rect|line|polyline|ellipse)",\s*\{(.*?)\}', re.S)
STATIC_ELEMENT = re.compile(r"<(path|polygon|circle|rect|line|polyline|ellipse)\s+([^>]*?)\s*/?>")
OBJECT_ATTR = re.compile(r'"?([\w-]+)"?\s*:\s*"([^"]*)"')
HTML_ATTR = re.compile(r'([\w-]+)="([^"]*)"')
BBOX_PREFIX = "M24 0v24H0V0"
SKIPPED_SVG_ATTRS = {"xmlns"}


def camel(name: str) -> str:
    head, *rest = name.split("-")
    return head + "".join(part.capitalize() for part in rest)


def find_children(source: str, var: str) -> str:
    match = re.search(rf"\b{re.escape(var)}\s*=\s*\[", source)
    if not match:
        return ""
    depth, index = 0, match.end() - 1
    for index in range(match.end() - 1, len(source)):
        char = source[index]
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                break
    return source[match.end():index]


def jsx_attrs(pairs: list[tuple[str, str]]) -> str:
    return " ".join(f'{camel(key)}="{value}"' for key, value in pairs)


def parse_elements(block: str) -> list[str]:
    elements = []
    for tag, body in ELEMENT.findall(block):
        pairs = OBJECT_ATTR.findall(body)
        elements.append((tag, pairs))
    for tag, body in STATIC_ELEMENT.findall(block):
        elements.append((tag, HTML_ATTR.findall(body)))

    rendered = []
    for tag, pairs in elements:
        if any(key == "d" and value.startswith(BBOX_PREFIX) for key, value in pairs):
            continue
        rendered.append(f"\t\t<{tag} {jsx_attrs(pairs)} />")
    return rendered


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)

    with open(sys.argv[1], encoding="utf-8") as handle:
        source = handle.read()

    lines = [
        'import type React from "react";',
        "",
        "export type IconProps = React.SVGProps<SVGSVGElement>;",
        "",
    ]
    count = 0
    for match in SVG_RENDER.finditer(source):
        children = parse_elements(find_children(source, match.group("children")))
        if not children:
            print(f"skip {match.group('name')}: no drawable children found")
            continue

        count += 1
        attrs = [
            (key, value)
            for key, value in OBJECT_ATTR.findall(match.group("attrs"))
            if key not in SKIPPED_SVG_ATTRS
        ]
        lines += [
            f"/** Source: {match.group('name')} (children {match.group('children')}) */",
            f"export const Icon{count}_{match.group('name')}: React.FC<IconProps> = (props) => (",
            f'\t<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {jsx_attrs(attrs)} {{...props}}>',
            *children,
            "\t</svg>",
            ");",
            "",
        ]

    with open(sys.argv[2], "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))

    print(f"{count} icons written to {sys.argv[2]}")


if __name__ == "__main__":
    main()
