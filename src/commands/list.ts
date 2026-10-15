import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight, printDivider } from "../utils/branding";
import { fileExists, listDirs, listFiles, readFile } from "../utils/fs";
import {
  ALL_TARGETS,
  getTargetConfig,
  getTargetDirectories,
  parseTargets,
  readSavedTargets,
} from "../utils/target";

interface ItemInfo {
  name: string;
  path: string;
  description?: string;
}

function truncate(text: string): string {
  return text.slice(0, 60) + (text.length > 60 ? "..." : "");
}

function extractDescription(content: string, isCommand: boolean): string | undefined {
  const match = content.match(/description:\s*(.+)/);
  if (match) {
    return truncate(match[1].trim());
  }
  if (isCommand) {
    const firstLine = content.trim().split("\n")[0];
    if (firstLine && !firstLine.startsWith("#") && !firstLine.startsWith("---")) {
      return truncate(firstLine);
    }
  }
  return undefined;
}

function getItems(dir: string, extension: string, isCommand: boolean): ItemInfo[] {
  const files = listFiles(dir, extension);
  return files.map((file) => {
    const filePath = join(dir, file);
    const content = fileExists(filePath) ? readFile(filePath) : "";
    return {
      name: file.replace(extension, ""),
      path: filePath,
      description: extractDescription(content, isCommand),
    };
  });
}

function getSkills(dir: string): ItemInfo[] {
  const skillDirs = listDirs(dir);
  return skillDirs.map((skillName) => {
    const skillPath = join(dir, skillName);
    const skillFile = join(skillPath, "SKILL.mdc");
    const altSkillFile = join(skillPath, "SKILL.md");

    let description: string | undefined;

    if (fileExists(skillFile)) {
      const content = readFile(skillFile);
      description = extractDescription(content, false);
    } else if (fileExists(altSkillFile)) {
      const content = readFile(altSkillFile);
      description = extractDescription(content, false);
    }

    return {
      name: skillName,
      path: skillPath,
      description,
    };
  });
}

function printSection(title: string, items: ItemInfo[], verbose: boolean): void {
  if (items.length === 0) return;

  console.log();
  console.log(pc.bold(pc.cyan(`  ${title}`)) + pc.dim(` (${items.length})`));
  console.log();

  for (const item of items) {
    console.log(`  ${pc.green("●")} ${highlight(item.name)}`);
    if (item.description) {
      console.log(pc.dim(`    ${item.description}`));
    }
    if (verbose) {
      console.log(pc.dim(`    ${item.path}`));
    }
  }
}

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all commands, rules, and skills",
  },
  args: {
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only list commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only list rules",
      default: false,
    },
    skills: {
      type: "boolean",
      alias: "s",
      description: "Only list skills",
      default: false,
    },
    target: {
      type: "string",
      alias: "t",
      description: `Target IDE(s), comma-separated: ${ALL_TARGETS.join(", ")}, or 'dual'. Defaults to the targets saved by init`,
    },
    verbose: {
      type: "boolean",
      alias: "v",
      description: "Show full file paths",
      default: false,
    },
  },
  async run({ args }) {
    const listAll = !args.commands && !args.rules && !args.skills;
    const shouldListCommands = listAll || args.commands;
    const shouldListRules = listAll || args.rules;
    const shouldListSkills = listAll || args.skills;

    p.intro(pc.bgCyan(pc.black(" fivem-devkit list ")));

    const targets: InstructionTarget[] = parseTargets(args.target) ??
      readSavedTargets() ?? ["cursor"];

    const sections = targets.map((target) => {
      const { commandsDir, rulesDir, skillsDir } = getTargetDirectories(target);
      const config = getTargetConfig(target);
      return {
        target,
        commands: shouldListCommands ? getItems(commandsDir, config.commandsExtension, true) : [],
        rules: shouldListRules ? getItems(rulesDir, config.rulesExtension, false) : [],
        skills: shouldListSkills ? getSkills(skillsDir) : [],
      };
    });

    const total = sections.reduce(
      (sum, section) =>
        sum + section.commands.length + section.rules.length + section.skills.length,
      0,
    );

    if (total === 0) {
      console.log();
      console.log(pc.yellow("  No commands, rules, or skills found."));
      console.log(pc.dim("  Run ") + highlight("fivem-devkit init") + pc.dim(" to get started."));
      console.log();
      p.outro(pc.dim("Nothing to show"));
      return;
    }

    printDivider();

    for (const { target, commands, rules, skills } of sections) {
      const config = getTargetConfig(target);
      if (targets.length > 1) {
        console.log();
        console.log(pc.bold(`  ◆ ${config.label}`));
      }

      const commandsTitle =
        config.commandsLabel.charAt(0).toUpperCase() + config.commandsLabel.slice(1);
      printSection(`📜 ${commandsTitle}`, commands, args.verbose);
      printSection("📋 Rules", rules, args.verbose);
      printSection("🎯 Skills", skills, args.verbose);
      console.log();
    }

    printDivider();
    p.outro(pc.dim(`Total: ${total} item${total !== 1 ? "s" : ""}`));
  },
});
