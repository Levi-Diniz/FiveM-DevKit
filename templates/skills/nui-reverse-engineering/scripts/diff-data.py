"""Compare literal data between the original bundle and the reconstructed source.

Usage:
    python -I diff-data.py <app.js> <src dir or file> [--bundle-regex R] [--source-regex R]

Defaults compare hex colors. Every match is compared as an ordered sequence, so a palette
or option list with a missing, extra or swapped entry is reported.

Examples:
    python -I diff-data.py app.js ../src                                  # hex colors
    python -I diff-data.py app.js ../src --bundle-regex 'title:\\s*"([^"]+)"' --source-regex '\\("([^"]+)"'
    python -I diff-data.py app.js ../src/data/genetics.ts --bundle-regex 'name:\\s*"([^"]+)"' --source-regex 'genetic\\(\\d+,\\s*"([^"]+)"'
"""

import argparse
import os
import re

HEX = r"#[0-9a-fA-F]{6}\b"
SOURCE_EXTENSIONS = (".ts", ".tsx", ".js", ".jsx", ".vue", ".css")


def read_sources(target: str) -> str:
    if os.path.isfile(target):
        with open(target, encoding="utf-8") as handle:
            return handle.read()

    chunks = []
    for root, dirs, files in os.walk(target):
        dirs[:] = [name for name in dirs if name not in {"node_modules", "dist"}]
        for name in sorted(files):
            if name.endswith(SOURCE_EXTENSIONS):
                with open(os.path.join(root, name), encoding="utf-8") as handle:
                    chunks.append(handle.read())
    return "\n".join(chunks)


def normalize(found: str | tuple[str, ...]) -> str:
    value = found if isinstance(found, str) else next((group for group in found if group), "")
    return value.lower() if value.startswith("#") else value


def matches(pattern: str, text: str) -> list[str]:
    return [normalize(found) for found in re.findall(pattern, text)]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("bundle")
    parser.add_argument("source")
    parser.add_argument("--bundle-regex", default=HEX)
    parser.add_argument("--source-regex")
    args = parser.parse_args()

    with open(args.bundle, encoding="utf-8") as handle:
        original = matches(args.bundle_regex, handle.read())
    rebuilt = matches(args.source_regex or args.bundle_regex, read_sources(args.source))

    missing = [value for value in original if value not in rebuilt]
    extra = [value for value in rebuilt if value not in original]
    rebuilt_filtered = [value for value in rebuilt if value in original]
    original_filtered = [value for value in original if value in rebuilt]

    print(f"bundle: {len(original)} matches | source: {len(rebuilt)} matches")
    print(f"missing in source ({len(set(missing))}): {sorted(set(missing))}")
    print(f"only in source ({len(set(extra))}): {sorted(set(extra))}")

    if original_filtered == rebuilt_filtered:
        print("order: identical for shared values")
        return

    for index, (left, right) in enumerate(zip(original_filtered, rebuilt_filtered)):
        if left != right:
            print(f"order: first divergence at #{index}: bundle={left!r} source={right!r}")
            break
    else:
        print("order: shared prefix identical, lengths differ (duplicates or repeated usage)")


if __name__ == "__main__":
    main()
