import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight, printDivider, printSuccess } from "../utils/branding";
import { getBrainDir, scaffoldBrain, writeBrainIndex } from "../utils/brain";
import { checkCopilotConflicts } from "../utils/copilot";
import {
  AGENT_BOARD_FILE,
  type ConflictStrategy,
  type TargetInstallResult,
  type TemplateSelection,
  applyTargetProfile,
  ensureAgentBoard,
  findConflicts,
  installForTarget,
  needsAgentBoard,
} from "../utils/install";
import {
  ALL_TARGETS,
  DUAL_TARGETS,
  formatTargets,
  getTargetConfig,
  parseTargets,
  promptTargetsSelection,
  readSavedTargets,
  saveTargets,
} from "../utils/target";
import {
  type TemplateManifest,
  type TemplateType,
  fetchTemplateManifest,
  getSkillLabel,
  getTemplateLabel,
} from "../utils/templates";

const SECOND_BRAIN_RULE = "second-brain.md";

function cancel(message = "Operation cancelled"): never {
  p.cancel(message);
  process.exit(0);
}

async function selectTemplates(
  type: TemplateType,
  availableTemplates: string[],
): Promise<string[] | symbol> {
  const labelFn = type === "skills" ? getSkillLabel : getTemplateLabel;

  const selectionMode = await p.select({
    message: `How would you like to add ${type}?`,
    options: [
      {
        value: "all",
        label: `Add all ${availableTemplates.length} ${type}`,
        hint: "Install everything",
      },
      {
        value: "select",
        label: "Select specific items",
        hint: "Choose which ones to install",
      },
    ],
  });

  if (p.isCancel(selectionMode)) return selectionMode;

  if (selectionMode === "all") {
    return availableTemplates;
  }

  const selectedTemplates = await p.multiselect({
    message: `Select ${type} to add:`,
    options: availableTemplates.map((template) => ({
      value: template,
      label: labelFn(template),
      hint: template,
    })),
    required: true,
  });

  return selectedTemplates as string[] | symbol;
}

async function handleConflicts(conflictingFiles: string[]): Promise<ConflictStrategy | symbol> {
  console.log();
  console.log(pc.yellow(`⚠ ${conflictingFiles.length} existing files found:`));
  for (const file of conflictingFiles) {
    console.log(pc.dim(`   └─ ${file}`));
  }
  console.log();

  const strategy = await p.select({
    message: "How would you like to handle conflicts?",
    options: [
      {
        value: "overwrite",
        label: "Overwrite existing files",
        hint: "Replace all conflicting files",
      },
      {
        value: "merge",
        label: "Merge (keep existing, add new only)",
        hint: "Skip files that already exist",
      },
      {
        value: "cancel",
        label: "Cancel",
        hint: "Abort the operation",
      },
    ],
  });

  if (p.isCancel(strategy) || strategy === "cancel") return Symbol.for("cancel");
  return strategy as ConflictStrategy;
}

async function resolveSelection(
  manifest: TemplateManifest,
  args: { all?: boolean },
  types: Record<TemplateType, boolean>,
): Promise<TemplateSelection> {
  const selection: TemplateSelection = { commands: [], rules: [], skills: [] };

  for (const type of ["commands", "rules", "skills"] as const) {
    if (!types[type]) continue;

    if (args.all) {
      selection[type] = manifest[type];
      continue;
    }

    const picked = await selectTemplates(type, manifest[type]);
    if (p.isCancel(picked)) cancel();
    selection[type] = picked as string[];
  }

  return selection;
}

function printTargetResult(result: TargetInstallResult, excluded: string[]): void {
  const config = getTargetConfig(result.target);
  printSuccess(highlight(config.label));

  const groups: [string, string[]][] = [
    [config.commandsLabel, result.commands],
    [config.rulesLabel, result.rules],
    ["skills", result.skills],
  ];

  for (const [label, items] of groups) {
    if (items.length === 0) continue;
    console.log(pc.dim(`   ${label}: ${pc.green(`+${items.length}`)}  ${items.join(", ")}`));
  }

  for (const skipped of result.skipped) {
    console.log(pc.dim(`   ${pc.yellow("○")} ${skipped} (kept existing)`));
  }

  if (excluded.length > 0) {
    console.log(
      pc.dim(
        `   profile: ${excluded.length} left out (${excluded.join(", ")}), use --full to include`,
      ),
    );
  }
}

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description:
      "Install FiveM DevKit commands, rules and skills for one or more AI IDEs (e.g. Claude Code + AntiGravity)",
  },
  args: {
    force: {
      type: "boolean",
      alias: "f",
      description: "Overwrite existing files without prompting",
      default: false,
    },
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only initialize commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only initialize rules",
      default: false,
    },
    skills: {
      type: "boolean",
      alias: "s",
      description: "Only initialize skills",
      default: false,
    },
    all: {
      type: "boolean",
      alias: "a",
      description: "Install all templates without selection prompts",
      default: false,
    },
    full: {
      type: "boolean",
      description: "Ignore per-target profiles and install every selected template in every IDE",
      default: false,
    },
    target: {
      type: "string",
      alias: "t",
      description: `Target AI IDE(s), comma-separated: ${ALL_TARGETS.join(", ")}, or 'dual' (claude-code + google-antigravity)`,
      default: undefined,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();

    const initAll = !args.commands && !args.rules && !args.skills;
    const types: Record<TemplateType, boolean> = {
      commands: initAll || args.commands,
      rules: initAll || args.rules,
      skills: initAll || args.skills,
    };

    p.intro(pc.bgCyan(pc.black(" fivem-devkit init ")));

    let targets = parseTargets(args.target);
    if (!targets) {
      if (args.target) {
        p.log.warn(`Unknown target "${args.target}". Valid: ${ALL_TARGETS.join(", ")}, dual`);
      }
      const selection = await promptTargetsSelection(readSavedTargets(cwd) ?? DUAL_TARGETS);
      if (p.isCancel(selection)) cancel();
      targets = selection as InstructionTarget[];
    }

    p.log.info(`Targets: ${highlight(formatTargets(targets))}`);

    const s = p.spinner();
    let manifest: TemplateManifest;

    try {
      s.start("Fetching template manifest...");
      manifest = await fetchTemplateManifest();
      s.stop("Template manifest loaded");
    } catch (error) {
      s.stop("Failed to fetch manifest");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }

    const selection = await resolveSelection(manifest, args, types);
    if (
      selection.commands.length === 0 &&
      selection.rules.length === 0 &&
      selection.skills.length === 0
    ) {
      cancel("No templates selected");
    }

    if (targets.includes("github-copilot")) {
      const canProceed = await checkCopilotConflicts(cwd, args.force ?? false);
      if (!canProceed) cancel();
    }

    const plans = targets.map((target) =>
      args.full
        ? { target, selection, excluded: [] as string[] }
        : { target, ...applyTargetProfile(target, selection, manifest) },
    );

    let strategy: ConflictStrategy = "overwrite";
    const conflicts = plans
      .filter((plan) => plan.target !== "github-copilot")
      .flatMap((plan) => findConflicts(plan.target, cwd, plan.selection));

    if (conflicts.length > 0 && !args.force) {
      const picked = await handleConflicts(conflicts);
      if (typeof picked === "symbol") cancel();
      strategy = picked;
    }

    const boardCreated = needsAgentBoard(targets, selection) && ensureAgentBoard(cwd);

    // The second-brain rule points at the vault, so make sure it exists with the standard pieces
    let brainCreated: string[] = [];
    if (selection.rules.includes(SECOND_BRAIN_RULE)) {
      brainCreated = scaffoldBrain(cwd);
      writeBrainIndex(getBrainDir(cwd));
    }

    const results: TargetInstallResult[] = [];

    try {
      for (const plan of plans) {
        const label = getTargetConfig(plan.target).label;
        s.start(`Installing for ${label}...`);
        results.push(await installForTarget(plan.target, cwd, plan.selection, strategy));
        s.stop(`${label} ready`);
      }
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }

    saveTargets(targets, cwd);

    printDivider();
    console.log();
    results.forEach((result, index) => {
      printTargetResult(result, plans[index].excluded);
    });

    if (targets.includes("claude-code")) {
      console.log(pc.dim("   CLAUDE.md updated (managed block)"));
    }
    if (boardCreated) {
      console.log(pc.dim(`   ${AGENT_BOARD_FILE} created for multi-agent coordination`));
    }
    if (brainCreated.length > 0) {
      console.log(pc.dim(`   Second Brain: ${brainCreated.length} files added (existing notes untouched)`));
    }

    const totalAdded = results.reduce(
      (sum, r) => sum + r.commands.length + r.rules.length + r.skills.length,
      0,
    );

    console.log();
    if (totalAdded === 0) {
      p.outro(pc.yellow("No new templates added (all selected files already exist)"));
    } else {
      p.outro(pc.green(`✨ FiveM DevKit initialized for ${formatTargets(targets)}!`));
    }
  },
});
