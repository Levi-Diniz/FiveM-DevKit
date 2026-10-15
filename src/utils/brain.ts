import { readdirSync, statSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import { copyDir, dirExists, ensureDir, fileExists, listDirs, readFile, writeFile } from "./fs";
import { getLocalTemplatesDir } from "./templates";

export const BRAIN_PREFIX = "brain-";
const INDEX_FILE = "INDEX.md";
const TEMPLATES_DIR = "_templates";
const NON_NOTE_FILES = new Set([INDEX_FILE, "README.md"]);

/** Section order and headings used by INDEX.md. */
const NOTE_TYPES: { type: string; folder: string; heading: string }[] = [
  { type: "project", folder: "project", heading: "Projeto" },
  { type: "decision", folder: "decisions", heading: "Decisões" },
  { type: "bug", folder: "bugs", heading: "Bugs" },
  { type: "gotcha", folder: "gotchas", heading: "Gotchas" },
  { type: "concept", folder: "concepts", heading: "Conceitos" },
];

/**
 * Vault folder name for a workspace: an existing `brain-*` folder wins,
 * otherwise `brain-<workspace folder name>`.
 */
export function resolveBrainDirName(cwd: string): string {
  const existing = listDirs(cwd)
    .filter((dir) => dir.startsWith(BRAIN_PREFIX))
    .sort();
  if (existing.length > 0) return existing[0];

  const slug = basename(cwd).trim().replace(/\s+/g, "-");
  return `${BRAIN_PREFIX}${slug}`;
}

export function getBrainDir(cwd: string): string {
  return join(cwd, resolveBrainDirName(cwd));
}

function getBrainTemplateDir(): string {
  return join(getLocalTemplatesDir(), "brain");
}

function listFilesRecursive(dir: string): string[] {
  if (!dirExists(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...listFilesRecursive(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

/**
 * Create the vault, or add whatever pieces of the standard structure are
 * missing. Existing files are never overwritten. Returns the created paths.
 */
export function scaffoldBrain(cwd: string): string[] {
  const brainDir = getBrainDir(cwd);
  const templateDir = getBrainTemplateDir();
  const created: string[] = [];

  if (!dirExists(templateDir)) {
    throw new Error(`Brain templates not found at ${templateDir}`);
  }

  for (const source of listFilesRecursive(templateDir)) {
    const relPath = relative(templateDir, source);
    const target = join(brainDir, relPath);
    if (fileExists(target)) continue;
    writeFile(target, readFile(source));
    created.push(relative(cwd, target));
  }

  for (const { folder } of NOTE_TYPES) {
    ensureDir(join(brainDir, folder));
  }

  return created;
}

/** Copy only the note templates (used when refreshing an existing vault). */
export function copyBrainTemplates(cwd: string): void {
  const source = join(getBrainTemplateDir(), TEMPLATES_DIR);
  if (dirExists(source)) copyDir(source, join(getBrainDir(cwd), TEMPLATES_DIR));
}

export interface BrainNote {
  /** Path relative to the vault, with forward slashes. */
  path: string;
  /** File name without extension: the target of `[[wikilinks]]`. */
  name: string;
  hasFrontmatter: boolean;
  type?: string;
  status?: string;
  summary?: string;
  updated?: string;
  files: string[];
  tags: string[];
  title?: string;
  content: string;
}

function parseList(value: string | undefined, blockItems: string[]): string[] {
  if (blockItems.length > 0) return blockItems;
  if (!value) return [];
  const trimmed = value.trim();
  const inner = trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed;
  return inner
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/** Minimal YAML frontmatter reader: scalars, inline lists and `- item` lists. */
function parseNoteFrontmatter(
  content: string,
): Record<string, { value?: string; items: string[] }> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;

  const fields: Record<string, { value?: string; items: string[] }> = {};
  let current: string | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && current) {
      fields[current].items.push(item[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    const field = line.match(/^([\w-]+):\s*(.*)$/);
    if (field) {
      current = field[1];
      fields[current] = { value: field[2].trim() || undefined, items: [] };
    }
  }

  return fields;
}

function toVaultPath(path: string): string {
  return path.split(sep).join("/");
}

export function readBrainNotes(brainDir: string): BrainNote[] {
  return listFilesRecursive(brainDir)
    .filter((path) => path.endsWith(".md"))
    .map((path) => toVaultPath(relative(brainDir, path)))
    .filter((path) => !path.startsWith(`${TEMPLATES_DIR}/`) && !path.startsWith("."))
    .filter((path) => !NON_NOTE_FILES.has(path.split("/").pop() ?? ""))
    .map((path) => {
      const content = readFile(join(brainDir, path));
      const fields = parseNoteFrontmatter(content);
      const folder = path.includes("/") ? path.split("/")[0] : "";
      const folderType = NOTE_TYPES.find((t) => t.folder === folder)?.type;
      const scalar = (key: string) => fields?.[key]?.value?.replace(/^["']|["']$/g, "");

      return {
        path,
        name: (path.split("/").pop() ?? path).replace(/\.md$/, ""),
        hasFrontmatter: fields !== null,
        type: scalar("type") ?? folderType,
        status: scalar("status"),
        summary: scalar("summary"),
        updated: scalar("updated"),
        files: parseList(fields?.files?.value, fields?.files?.items ?? []),
        tags: parseList(fields?.tags?.value, fields?.tags?.items ?? []),
        title: content.match(/^#\s+(.+)$/m)?.[1]?.trim(),
        content,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function formatIndexLine(note: BrainNote): string {
  const parts = [`- [[${note.name}]]`];
  parts.push(`— ${note.summary ?? note.title ?? "(sem resumo)"}`);
  if (note.files.length > 0) {
    parts.push(`· files: ${note.files.map((file) => `\`${file}\``).join(", ")}`);
  }
  if (note.tags.length > 0) {
    parts.push(`· ${note.tags.map((tag) => `#${tag}`).join(" ")}`);
  }
  return parts.join(" ");
}

export function buildBrainIndex(notes: BrainNote[]): string {
  const lines = [
    "# Índice do Second Brain",
    "",
    "> Gerado por `fdk brain index` a partir do frontmatter das notas. Para mudar uma linha, edite a nota e rode o comando de novo.",
    "> Sem o CLI, adicione a linha à mão no mesmo formato: `- [[nome-da-nota]] — resumo · files: \\`caminho\\` · #tag`.",
    "",
  ];

  const active = notes.filter((note) => note.status !== "superseded");
  const superseded = notes.filter((note) => note.status === "superseded");

  for (const { type, heading } of NOTE_TYPES) {
    const group = active.filter((note) => note.type === type);
    if (group.length === 0) continue;
    lines.push(`## ${heading}`, "", ...group.map(formatIndexLine), "");
  }

  const known = new Set(NOTE_TYPES.map((t) => t.type));
  const others = active.filter((note) => !note.type || !known.has(note.type));
  if (others.length > 0) {
    lines.push("## Outras", "", ...others.map(formatIndexLine), "");
  }

  if (superseded.length > 0) {
    lines.push("## Substituídas (não seguir)", "", ...superseded.map(formatIndexLine), "");
  }

  if (notes.length === 0) {
    lines.push("_Nenhuma nota ainda. Use `/brain` para registrar a primeira._", "");
  }

  return lines.join("\n");
}

export function writeBrainIndex(brainDir: string): number {
  const notes = readBrainNotes(brainDir);
  writeFile(join(brainDir, INDEX_FILE), buildBrainIndex(notes));
  return notes.length;
}

export interface BrainIssue {
  note: string;
  message: string;
}

function stripCode(content: string): string {
  return content.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

/**
 * Find notes without frontmatter or summary, `files:` entries that no longer
 * exist in the workspace, and wikilinks that point to no note.
 */
export function checkBrain(cwd: string, brainDir: string): BrainIssue[] {
  const notes = readBrainNotes(brainDir);
  const issues: BrainIssue[] = [];

  const targets = new Set<string>();
  for (const path of listFilesRecursive(brainDir)) {
    const vaultPath = toVaultPath(relative(brainDir, path));
    const withoutExt = vaultPath.replace(/\.md$/, "");
    targets.add(withoutExt);
    targets.add(withoutExt.split("/").pop() ?? withoutExt);
  }

  for (const note of notes) {
    if (!note.hasFrontmatter) {
      issues.push({
        note: note.path,
        message: "no frontmatter (type, status, summary, files, tags)",
      });
    } else if (!note.summary) {
      issues.push({ note: note.path, message: "missing `summary` (used by INDEX.md)" });
    }

    for (const file of note.files) {
      if (file.includes("*")) continue;
      if (!fileExists(join(cwd, file))) {
        issues.push({ note: note.path, message: `files: \`${file}\` does not exist anymore` });
      }
    }

    for (const match of stripCode(note.content).matchAll(/\[\[([^\]]+)\]\]/g)) {
      const target = match[1].split("|")[0].split("#")[0].trim().replace(/\.md$/, "");
      if (!target) continue;
      if (!targets.has(target) && !targets.has(target.replace(/\/$/, ""))) {
        issues.push({ note: note.path, message: `broken wikilink [[${match[1]}]]` });
      }
    }
  }

  return issues;
}
