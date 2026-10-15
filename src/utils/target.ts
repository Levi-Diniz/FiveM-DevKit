import { join } from "node:path";
import * as p from "@clack/prompts";
import type { InstructionTarget } from "../types/init";
import { CONFIG_FILE } from "./constants";
import {
  fileExists,
  getAgentDir,
  getAgentRulesDir,
  getAgentSkillsDir,
  getAgentWorkflowsDir,
  getClaudeCommandsDir,
  getClaudeDir,
  getClaudeRulesDir,
  getClaudeSkillsDir,
  getCommandsDir,
  getCopilotCommandsDir,
  getCopilotInstructionsDir,
  getCopilotRulesDir,
  getCopilotSkillsDir,
  getCursorDir,
  getRulesDir,
  getSkillsDir,
  readFile,
  writeFile,
} from "./fs";

interface TargetDirectories {
  rootDir: string;
  commandsDir: string;
  rulesDir: string;
  skillsDir: string;
}

interface TargetConfig {
  label: string;
  hint: string;
  commandsLabel: string;
  rulesLabel: string;
  rulesExtension: string;
  commandsExtension: string;
}

export const ALL_TARGETS: InstructionTarget[] = [
  "cursor",
  "github-copilot",
  "google-antigravity",
  "claude-code",
];

/** `-t dual` installs the Claude Code + AntiGravity pair side by side. */
export const DUAL_TARGETS: InstructionTarget[] = ["google-antigravity", "claude-code"];

export const TARGET_CONFIGS: Record<InstructionTarget, TargetConfig> = {
  cursor: {
    label: "Cursor",
    hint: ".cursor/ directory",
    commandsLabel: "commands",
    rulesLabel: "rules",
    rulesExtension: ".mdc",
    commandsExtension: ".md",
  },
  "github-copilot": {
    label: "GitHub Copilot",
    hint: ".github/copilot-instructions/ directory",
    commandsLabel: "commands",
    rulesLabel: "rules",
    rulesExtension: ".md",
    commandsExtension: ".md",
  },
  "google-antigravity": {
    label: "Google AntiGravity",
    hint: ".agents/ directory",
    commandsLabel: "workflows",
    rulesLabel: "rules",
    rulesExtension: ".md",
    commandsExtension: ".md",
  },
  "claude-code": {
    label: "Claude Code",
    hint: ".claude/ directory + CLAUDE.md",
    commandsLabel: "commands",
    rulesLabel: "rules",
    rulesExtension: ".md",
    commandsExtension: ".md",
  },
};

const TARGET_OPTIONS = ALL_TARGETS.map((value) => ({
  value,
  label: TARGET_CONFIGS[value].label,
  hint: TARGET_CONFIGS[value].hint,
}));

export async function promptTargetSelection(): Promise<InstructionTarget | symbol> {
  return await p.select({
    message: "Which AI IDE are you targeting?",
    options: TARGET_OPTIONS,
    initialValue: "cursor" as InstructionTarget,
  });
}

export async function promptTargetsSelection(
  initialValues: InstructionTarget[] = DUAL_TARGETS,
): Promise<InstructionTarget[] | symbol> {
  return (await p.multiselect({
    message:
      "Which AI IDEs are you using? (space to toggle, pick several to run them side by side)",
    options: TARGET_OPTIONS,
    initialValues,
    required: true,
  })) as InstructionTarget[] | symbol;
}

export function isValidTarget(value: string | undefined): value is InstructionTarget {
  return ALL_TARGETS.includes(value as InstructionTarget);
}

/**
 * Parse a `--target` value. Accepts a single target, a comma-separated list
 * (`claude-code,google-antigravity`) or the `dual` shortcut.
 * Returns null when the value is missing or contains an unknown target.
 */
export function parseTargets(value: string | undefined): InstructionTarget[] | null {
  if (!value) return null;
  if (value.trim() === "dual") return [...DUAL_TARGETS];

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0 || !parts.every(isValidTarget)) return null;

  return [...new Set(parts as InstructionTarget[])];
}

interface DevkitConfig {
  targets?: InstructionTarget[];
}

function getConfigPath(cwd: string): string {
  return join(cwd, CONFIG_FILE);
}

export function readSavedTargets(cwd: string = process.cwd()): InstructionTarget[] | null {
  const configPath = getConfigPath(cwd);
  if (!fileExists(configPath)) return null;

  try {
    const config = JSON.parse(readFile(configPath)) as DevkitConfig;
    const targets = (config.targets ?? []).filter(isValidTarget);
    return targets.length > 0 ? targets : null;
  } catch {
    return null;
  }
}

export function saveTargets(targets: InstructionTarget[], cwd: string = process.cwd()): void {
  const config: DevkitConfig = { targets };
  writeFile(getConfigPath(cwd), `${JSON.stringify(config, null, 2)}\n`);
}

/**
 * Resolve targets for a command: explicit `--target` wins, then the targets saved
 * by `init` in `.fivemdevkit`, then an interactive prompt.
 */
export async function resolveTargets(
  value: string | undefined,
  cwd: string = process.cwd(),
): Promise<InstructionTarget[] | symbol> {
  const explicit = parseTargets(value);
  if (explicit) return explicit;

  if (value) {
    p.log.warn(`Unknown target "${value}". Valid: ${ALL_TARGETS.join(", ")}, dual`);
  }

  const saved = readSavedTargets(cwd);
  if (saved && !value) return saved;

  return promptTargetsSelection(saved ?? DUAL_TARGETS);
}

export function getTargetDirectories(
  target: InstructionTarget,
  cwd: string = process.cwd(),
): TargetDirectories {
  switch (target) {
    case "cursor":
      return {
        rootDir: getCursorDir(cwd),
        commandsDir: getCommandsDir(cwd),
        rulesDir: getRulesDir(cwd),
        skillsDir: getSkillsDir(cwd),
      };
    case "github-copilot":
      return {
        rootDir: getCopilotInstructionsDir(cwd),
        commandsDir: getCopilotCommandsDir(cwd),
        rulesDir: getCopilotRulesDir(cwd),
        skillsDir: getCopilotSkillsDir(cwd),
      };
    case "google-antigravity":
      return {
        rootDir: getAgentDir(cwd),
        commandsDir: getAgentWorkflowsDir(cwd),
        rulesDir: getAgentRulesDir(cwd),
        skillsDir: getAgentSkillsDir(cwd),
      };
    case "claude-code":
      return {
        rootDir: getClaudeDir(cwd),
        commandsDir: getClaudeCommandsDir(cwd),
        rulesDir: getClaudeRulesDir(cwd),
        skillsDir: getClaudeSkillsDir(cwd),
      };
  }
}

export function getTargetConfig(target: InstructionTarget): TargetConfig {
  return TARGET_CONFIGS[target];
}

export function formatTargets(targets: InstructionTarget[]): string {
  return targets.map((target) => TARGET_CONFIGS[target].label).join(" + ");
}
