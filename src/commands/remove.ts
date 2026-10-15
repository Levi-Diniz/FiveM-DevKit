import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight, printSuccess } from "../utils/branding";
import { dirExists, fileExists, listDirs, listFiles, removeFile } from "../utils/fs";
import { updateClaudeMd } from "../utils/install";
import {
  ALL_TARGETS,
  formatTargets,
  getTargetConfig,
  getTargetDirectories,
  resolveTargets,
} from "../utils/target";

type ItemType = "command" | "rule" | "skill";

interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

/** Path of an item inside a target, or null when that target does not have it. */
function findItemPath(target: InstructionTarget, itemType: ItemType, name: string): string | null {
  const { commandsDir, rulesDir, skillsDir } = getTargetDirectories(target);
  const config = getTargetConfig(target);

  if (itemType === "skill") {
    const path = join(skillsDir, name);
    return dirExists(path) ? path : null;
  }

  const path =
    itemType === "command"
      ? join(commandsDir, `${name}${config.commandsExtension}`)
      : join(rulesDir, `${name}${config.rulesExtension}`);
  return fileExists(path) ? path : null;
}

function listItems(target: InstructionTarget, itemType: ItemType): string[] {
  const { commandsDir, rulesDir, skillsDir } = getTargetDirectories(target);
  const config = getTargetConfig(target);

  if (itemType === "skill") return listDirs(skillsDir);
  if (itemType === "command") {
    return listFiles(commandsDir, config.commandsExtension).map((f) =>
      f.slice(0, -config.commandsExtension.length),
    );
  }
  return listFiles(rulesDir, config.rulesExtension).map((f) =>
    f.slice(0, -config.rulesExtension.length),
  );
}

export const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a command, rule, or skill from every configured AI IDE",
  },
  args: {
    type: {
      type: "string",
      alias: "t",
      description: "Type: 'command', 'rule', or 'skill'",
    },
    name: {
      type: "string",
      alias: "n",
      description: "Name of the command, rule, or skill to remove",
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Skip confirmation",
      default: false,
    },
    target: {
      type: "string",
      description: `Target IDE(s), comma-separated: ${ALL_TARGETS.join(", ")}, or 'dual'. Defaults to the targets saved by init`,
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" fivem-devkit remove ")));

    const resolved = await resolveTargets(args.target);
    if (p.isCancel(resolved)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
    const targets = resolved as InstructionTarget[];

    console.log(pc.dim(`  Target: ${highlight(formatTargets(targets))}`));
    console.log();

    const itemsByType = (type: ItemType): string[] =>
      [...new Set(targets.flatMap((target) => listItems(target, type)))].sort();

    const available: Record<ItemType, string[]> = {
      command: itemsByType("command"),
      rule: itemsByType("rule"),
      skill: itemsByType("skill"),
    };

    if (
      available.command.length === 0 &&
      available.rule.length === 0 &&
      available.skill.length === 0
    ) {
      console.log(pc.yellow("  No commands, rules, or skills to remove."));
      console.log();
      p.outro(pc.dim("Nothing to do"));
      return;
    }

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule", "skill"].includes(args.type)) {
      itemType = args.type as ItemType;
    } else {
      const typeOptions: SelectOption[] = (["command", "rule", "skill"] as const)
        .filter((type) => available[type].length > 0)
        .map((type) => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          hint: `${available[type].length} available`,
        }));

      const typeResult = await p.select({
        message: "What do you want to remove?",
        options: typeOptions,
      });

      if (p.isCancel(typeResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemType = typeResult as ItemType;
    }

    const items = available[itemType];

    if (items.length === 0) {
      p.cancel(`No ${itemType}s found`);
      process.exit(0);
    }

    if (args.name && items.includes(args.name)) {
      itemName = args.name;
    } else {
      const nameResult = await p.select({
        message: `Select ${itemType} to remove:`,
        options: items.map((item) => ({ value: item, label: item })),
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemName = nameResult as string;
    }

    const matches = targets
      .map((target) => ({ target, path: findItemPath(target, itemType, itemName) }))
      .filter((match): match is { target: InstructionTarget; path: string } => match.path !== null);

    if (matches.length === 0) {
      p.cancel(`${itemType} '${itemName}' not found`);
      process.exit(1);
    }

    if (!args.force) {
      const shouldDelete = await p.confirm({
        message: `Delete ${highlight(itemName)} from ${formatTargets(matches.map((m) => m.target))}?${itemType === "skill" ? " (This removes the entire skill directory)" : ""}`,
        initialValue: false,
      });

      if (p.isCancel(shouldDelete) || !shouldDelete) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    try {
      console.log();
      for (const { target, path } of matches) {
        removeFile(path);
        if (target === "claude-code" && itemType === "command") {
          updateClaudeMd(process.cwd());
        }
        printSuccess(`Removed ${highlight(itemName)} from ${getTargetConfig(target).label}`);
      }
      console.log();
      p.outro(pc.green("✨ Done!"));
    } catch (error) {
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
