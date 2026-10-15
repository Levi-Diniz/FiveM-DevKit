import { join, relative } from "node:path";
import type { InstructionTarget } from "../types/init";
import { resolveBrainDirName } from "./brain";
import { installCopilotInstructions } from "./copilot";
import {
  dirExists,
  ensureDir,
  fileExists,
  getClaudeMdPath,
  getCopilotInstructionsDir,
  getCopilotInstructionsPath,
  listFiles,
  readFile,
  writeFile,
} from "./fs";
import { getTargetDirectories } from "./target";
import {
  type TemplateManifest,
  convertMdToMdc,
  copyLocalSkill,
  copyLocalSkillForAntiGravity,
  copyLocalSkillForClaude,
  fetchMultipleTemplates,
  renderTemplateForTarget,
  stripFrontmatter,
  transformCommandForClaude,
  transformCommandToWorkflow,
  transformRuleForAntiGravity,
  transformRuleForClaude,
  transformRuleForCursor,
  transformTocContentForCursor,
} from "./templates";

export interface TemplateSelection {
  commands: string[];
  rules: string[];
  skills: string[];
}

export type ConflictStrategy = "overwrite" | "merge";

export interface TargetInstallResult {
  target: InstructionTarget;
  commands: string[];
  rules: string[];
  skills: string[];
  skipped: string[];
}

export const MULTI_AGENT_RULE = "multi-agent.md";
export const AGENT_BOARD_FILE = "AGENT_BOARD.md";

/** The board is only needed when Claude Code and AntiGravity run side by side. */
export function needsAgentBoard(
  targets: InstructionTarget[],
  selection: TemplateSelection,
): boolean {
  return (
    targets.includes("claude-code") &&
    targets.includes("google-antigravity") &&
    selection.rules.includes(MULTI_AGENT_RULE)
  );
}

/**
 * Drop the templates a target's manifest profile excludes. Returns the filtered
 * selection plus what was left out, so callers can report it.
 */
export function applyTargetProfile(
  target: InstructionTarget,
  selection: TemplateSelection,
  manifest: TemplateManifest,
): { selection: TemplateSelection; excluded: string[] } {
  const exclude = manifest.profiles?.[target]?.exclude;
  if (!exclude) return { selection, excluded: [] };

  const filtered: TemplateSelection = { commands: [], rules: [], skills: [] };
  const excluded: string[] = [];

  for (const type of ["commands", "rules", "skills"] as const) {
    const blocked = new Set(exclude[type] ?? []);
    for (const item of selection[type]) {
      if (blocked.has(item)) {
        excluded.push(item);
      } else {
        filtered[type].push(item);
      }
    }
  }

  return { selection: filtered, excluded };
}

function getRuleOutputName(target: InstructionTarget, filename: string): string {
  return target === "cursor" ? convertMdToMdc(filename) : filename;
}

function transformCommand(
  target: InstructionTarget,
  content: string,
  filename: string,
  brainDir: string,
): string {
  const rendered = renderTemplateForTarget(content, target, brainDir);
  switch (target) {
    case "google-antigravity":
      return transformCommandToWorkflow(rendered, filename);
    case "claude-code":
      return transformCommandForClaude(rendered, filename);
    default:
      return stripFrontmatter(rendered);
  }
}

function transformRule(
  target: InstructionTarget,
  content: string,
  filename: string,
  brainDir: string,
): string {
  const rendered = renderTemplateForTarget(content, target, brainDir);
  switch (target) {
    case "google-antigravity":
      return transformRuleForAntiGravity(rendered, filename);
    case "claude-code":
      return transformRuleForClaude(rendered, filename);
    case "cursor": {
      const transformed = transformRuleForCursor(rendered, filename);
      return filename === "toc.md" ? transformTocContentForCursor(transformed) : transformed;
    }
    default:
      return rendered;
  }
}

function copySkill(target: InstructionTarget, skillName: string, skillsDir: string): boolean {
  switch (target) {
    case "google-antigravity":
      return copyLocalSkillForAntiGravity(skillName, skillsDir);
    case "claude-code":
      return copyLocalSkillForClaude(skillName, skillsDir);
    default:
      return copyLocalSkill(skillName, skillsDir, target === "cursor");
  }
}

/**
 * List files/dirs a selection would overwrite for a target, relative to cwd.
 */
export function findConflicts(
  target: InstructionTarget,
  cwd: string,
  selection: TemplateSelection,
): string[] {
  if (target === "github-copilot") {
    const existing = [getCopilotInstructionsPath(cwd), getCopilotInstructionsDir(cwd)].filter(
      (path) => fileExists(path),
    );
    return existing.map((path) => relative(cwd, path));
  }

  const { commandsDir, rulesDir, skillsDir } = getTargetDirectories(target, cwd);
  const paths = [
    ...selection.commands.map((file) => join(commandsDir, file)),
    ...selection.rules.map((file) => join(rulesDir, getRuleOutputName(target, file))),
  ].filter((path) => fileExists(path));
  const skillPaths = selection.skills
    .map((skill) => join(skillsDir, skill))
    .filter((path) => dirExists(path));

  return [...paths, ...skillPaths].map((path) => relative(cwd, path));
}

export async function installForTarget(
  target: InstructionTarget,
  cwd: string,
  selection: TemplateSelection,
  strategy: ConflictStrategy,
): Promise<TargetInstallResult> {
  const result: TargetInstallResult = {
    target,
    commands: [],
    rules: [],
    skills: [],
    skipped: [],
  };

  // Copilot writes a single generated index, so it is always regenerated as a whole
  if (target === "github-copilot") {
    const copilot = await installCopilotInstructions(
      cwd,
      selection.commands,
      selection.rules,
      selection.skills,
    );
    return { ...result, commands: copilot.commands, rules: copilot.rules, skills: copilot.skills };
  }

  const { rootDir, commandsDir, rulesDir, skillsDir } = getTargetDirectories(target, cwd);
  const brainDir = resolveBrainDirName(cwd);
  ensureDir(rootDir);

  const shouldSkip = (path: string, exists: boolean): boolean => {
    if (strategy === "merge" && exists) {
      result.skipped.push(relative(cwd, path));
      return true;
    }
    return false;
  };

  if (selection.commands.length > 0) {
    ensureDir(commandsDir);
    const templates = await fetchMultipleTemplates("commands", selection.commands);
    for (const [filename, content] of templates) {
      const filePath = join(commandsDir, filename);
      if (shouldSkip(filePath, fileExists(filePath))) continue;
      writeFile(filePath, transformCommand(target, content, filename, brainDir));
      result.commands.push(filename);
    }
  }

  if (selection.rules.length > 0) {
    ensureDir(rulesDir);
    const templates = await fetchMultipleTemplates("rules", selection.rules);
    for (const [filename, content] of templates) {
      const outputName = getRuleOutputName(target, filename);
      const filePath = join(rulesDir, outputName);
      if (shouldSkip(filePath, fileExists(filePath))) continue;
      writeFile(filePath, transformRule(target, content, filename, brainDir));
      result.rules.push(outputName);
    }
  }

  if (selection.skills.length > 0) {
    ensureDir(skillsDir);
    for (const skillName of selection.skills) {
      const skillPath = join(skillsDir, skillName);
      if (shouldSkip(skillPath, dirExists(skillPath))) continue;
      if (copySkill(target, skillName, skillsDir)) {
        result.skills.push(skillName);
      }
    }
  }

  if (target === "claude-code") {
    updateClaudeMd(cwd);
  }

  return result;
}

const CLAUDE_BLOCK_START = "<!-- fivem-devkit:start -->";
const CLAUDE_BLOCK_END = "<!-- fivem-devkit:end -->";

function buildClaudeBlock(cwd: string): string {
  const { commandsDir, rulesDir } = getTargetDirectories("claude-code", cwd);
  const commands = listFiles(commandsDir, ".md").map((file) => `/${file.replace(/\.md$/, "")}`);
  const hasToc = fileExists(join(rulesDir, "toc.md"));

  const lines = [
    CLAUDE_BLOCK_START,
    "## FiveM DevKit",
    "",
    "> Managed by fivem-devkit-cli. Changes inside this block are overwritten by `fdk init` / `fdk pull`.",
    "",
    hasToc
      ? "- **Rules**: `.claude/rules/` loads automatically. `toc.md` routes each task to the right skill and rule."
      : "- **Rules**: `.claude/rules/` loads automatically; NUI styling and FiveM security rules load when you touch matching files.",
    "- **Skills**: `.claude/skills/` (FiveM NUI, frontend, backend, design...). Read the matching `SKILL.md` before working in that domain.",
    "- **FiveM first**: if the project has `fxmanifest.lua`, `__resource.lua` or a NUI `web/` folder, the `fivem-nui` skill and `fivem-nui-styling` rule take priority over generic frontend skills for any UI work, and `security-fivem` applies to every net event and database query.",
  ];

  if (commands.length > 0) {
    lines.push(`- **Commands**: ${commands.join(", ")}`);
  }

  lines.push(
    `- **Second Brain**: project memory lives in \`${resolveBrainDirName(cwd)}/\` (shared with the user and other agents). Find notes through its \`INDEX.md\` or by grepping file names; follow \`.claude/rules/second-brain.md\` for when to read and write. Project knowledge goes there, not into your private memory, so every agent sees it.`,
  );

  if (fileExists(join(cwd, AGENT_BOARD_FILE))) {
    lines.push(
      `- **Multi-agent**: another AI agent (Google AntiGravity) may be editing this workspace at the same time. Follow \`.claude/rules/multi-agent.md\` and keep \`${AGENT_BOARD_FILE}\` up to date.`,
    );
  }

  if (fileExists(join(cwd, "GEMINI.md"))) {
    lines.push("", "Project guidelines shared with Google AntiGravity:", "", "@GEMINI.md");
  }

  lines.push(CLAUDE_BLOCK_END);
  return lines.join("\n");
}

/**
 * Create or refresh the managed block in CLAUDE.md, keeping anything the user
 * wrote outside of it.
 */
export function updateClaudeMd(cwd: string): void {
  const claudeMdPath = getClaudeMdPath(cwd);
  const block = buildClaudeBlock(cwd);

  if (!fileExists(claudeMdPath)) {
    writeFile(claudeMdPath, `# CLAUDE.md\n\n${block}\n`);
    return;
  }

  const current = readFile(claudeMdPath);
  const start = current.indexOf(CLAUDE_BLOCK_START);
  const end = current.indexOf(CLAUDE_BLOCK_END);

  const updated =
    start !== -1 && end > start
      ? current.slice(0, start) + block + current.slice(end + CLAUDE_BLOCK_END.length)
      : `${current.trimEnd()}\n\n${block}\n`;

  writeFile(claudeMdPath, updated);
}

const AGENT_BOARD_TEMPLATE = `# Agent Board

Shared coordination board for AI agents working on this workspace at the same time
(Claude Code + Google AntiGravity). Protocol: \`multi-agent.md\` rule.

## Roles

<!-- Optional split. Example: -->
<!-- - antigravity: NUI / web UI (web/, html/) -->
<!-- - claude: Lua client/server, database, code review -->

## In Progress

<!-- One line per task. Remove it when done. -->
<!-- - [claude] 2026-01-01 14:00 | Fix inventory sync | files: server/inventory.lua, shared/config.lua -->

## Handoffs

<!-- Newest first. Written by /handoff. -->
`;

/**
 * Create AGENT_BOARD.md when it does not exist yet. Returns true when created.
 */
export function ensureAgentBoard(cwd: string): boolean {
  const boardPath = join(cwd, AGENT_BOARD_FILE);
  if (fileExists(boardPath)) return false;
  writeFile(boardPath, AGENT_BOARD_TEMPLATE);
  return true;
}
