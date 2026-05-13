import fs from "fs";
import path from "path";

export interface ChangelogCommit {
  message: string;
  hash: string;
  url: string;
}

export interface ChangelogCategory {
  title: string;
  emoji: string;
  commits: ChangelogCommit[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  url: string;
  categories: ChangelogCategory[];
}

const CATEGORY_MAP: Record<string, { emoji: string; title: string }> = {
  "🚀 Features": { emoji: "🚀", title: "Features" },
  Features: { emoji: "🚀", title: "Features" },
  "🐛 Bug Fixes": { emoji: "🐛", title: "Bug Fixes" },
  "Bug Fixes": { emoji: "🐛", title: "Bug Fixes" },
  "📚 Documentation": { emoji: "📚", title: "Documentation" },
  Documentation: { emoji: "📚", title: "Documentation" },
  "♻️ Code Refactoring": { emoji: "♻️", title: "Code Refactoring" },
  "Code Refactoring": { emoji: "♻️", title: "Code Refactoring" },
  "🏠 Chores": { emoji: "🏠", title: "Chores" },
  Chores: { emoji: "🏠", title: "Chores" },
};

function parseCommit(line: string): ChangelogCommit | null {
  // Match patterns like: * feat(scope): message ([hash](url))
  const commitMatch = line.match(
    /^\*\s+(.+?)\s+\(\[([a-f0-9]+)\]\((https:\/\/[^)]+)\)\)$/
  );
  if (commitMatch) {
    return {
      message: commitMatch[1].trim(),
      hash: commitMatch[2],
      url: commitMatch[3],
    };
  }

  // Match patterns like: * **scope:** message ([hash](url))
  const altMatch = line.match(
    /^\*\s+\*\*([^:]+):\*\*\s+(.+?)\s+\(\[([a-f0-9]+)\]\((https:\/\/[^)]+)\)\)$/
  );
  if (altMatch) {
    return {
      message: `**${altMatch[1]}:** ${altMatch[2]}`.trim(),
      hash: altMatch[3],
      url: altMatch[4],
    };
  }

  return null;
}

function parseVersion(
  content: string,
  startIndex: number,
  endIndex: number
): ChangelogEntry | null {
  const section = content.slice(startIndex, endIndex);
  const lines = section.split("\n");

  // Parse version header: ## [1.4.0](url) (2025-12-07)
  const headerMatch = lines[0].match(
    /^##\s+\[([^\]]+)\]\(([^)]+)\)\s+\((\d{4}-\d{2}-\d{2})\)/
  );
  // Also match: ## 1.0.0 (2025-11-29)
  const simpleHeaderMatch = lines[0].match(
    /^##\s+(\d+\.\d+\.\d+)\s+\((\d{4}-\d{2}-\d{2})\)/
  );

  if (!headerMatch && !simpleHeaderMatch) {
    return null;
  }

  const version = headerMatch ? headerMatch[1] : simpleHeaderMatch![1];
  const url = headerMatch
    ? headerMatch[2]
    : `https://github.com/duongductrong/fivem-devkit/releases/tag/v${version}`;
  const date = headerMatch ? headerMatch[3] : simpleHeaderMatch![2];

  const categories: ChangelogCategory[] = [];
  let currentCategory: ChangelogCategory | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for category header: ### 🚀 Features
    const categoryMatch = line.match(/^###\s+(.+)$/);
    if (categoryMatch) {
      const categoryKey = categoryMatch[1].trim();
      const categoryInfo = CATEGORY_MAP[categoryKey];

      if (categoryInfo) {
        currentCategory = {
          title: categoryInfo.title,
          emoji: categoryInfo.emoji,
          commits: [],
        };
        categories.push(currentCategory);
      }
      continue;
    }

    // Parse commit entries
    if (line.startsWith("*") && currentCategory) {
      const commit = parseCommit(line);
      if (commit) {
        currentCategory.commits.push(commit);
      }
    }
  }

  return {
    version,
    date,
    url,
    categories: categories.filter((c) => c.commits.length > 0),
  };
}

export function parseChangelog(): ChangelogEntry[] {
  const changelogPath = path.resolve(process.cwd(), "../../CHANGELOG.md");
  const content = fs.readFileSync(changelogPath, "utf-8");

  const entries: ChangelogEntry[] = [];
  const versionRegex = /^## \[?\d+\.\d+\.\d+/gm;

  const matches: { index: number }[] = [];
  let match;

  while ((match = versionRegex.exec(content)) !== null) {
    matches.push({ index: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const startIndex = matches[i].index;
    const endIndex = matches[i + 1]?.index ?? content.length;

    const entry = parseVersion(content, startIndex, endIndex);
    if (entry && entry.categories.length > 0) {
      entries.push(entry);
    }
  }

  return entries;
}
