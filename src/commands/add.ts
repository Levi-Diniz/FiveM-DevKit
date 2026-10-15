import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight } from "../utils/branding";
import { dirExists, ensureDir, fileExists, writeFile } from "../utils/fs";
import { updateClaudeMd } from "../utils/install";
import {
  ALL_TARGETS,
  formatTargets,
  getTargetConfig,
  getTargetDirectories,
  resolveTargets,
} from "../utils/target";

type ItemType = "command" | "rule" | "skill";

const COMMAND_BODY = `You are a helpful assistant. Describe what this command does.

## Instructions
- Step 1: ...
- Step 2: ...

## Rules
- Be concise
- Focus on the task
`;

function getCommandTemplate(target: InstructionTarget): string {
  switch (target) {
    case "claude-code":
      return `---\ndescription: Describe what this command does\n---\n\n${COMMAND_BODY}\n## Input\n\n$ARGUMENTS\n`;
    case "google-antigravity":
      return `---\ndescription: Describe what this workflow does\n---\n\n${COMMAND_BODY}`;
    default:
      return `${COMMAND_BODY}\nSTART: Wait for user input.\n`;
  }
}

const RULE_BODY = `# Rule Title

Describe the rule behavior here.

## Guidelines
- Guideline 1
- Guideline 2
`;

function getRuleTemplate(target: InstructionTarget): string {
  switch (target) {
    case "claude-code":
      return `---\n# Delete this frontmatter to load the rule in every session, or narrow the globs.\npaths:\n  - "**/*"\n---\n\n${RULE_BODY}`;
    case "google-antigravity":
      return `---\ntrigger: model_decision\ndescription: Describe when this rule should apply\n---\n\n${RULE_BODY}`;
    default:
      return `---\ndescription: Describe when this rule should apply\nglobs: \nalwaysApply: false\n---\n\n${RULE_BODY}`;
  }
}

const SKILL_BODY = `# Skill Name

Brief description of what this skill enables.

## Core Capabilities

- Capability 1
- Capability 2

## When to Use

Use this skill when:
- Condition 1
- Condition 2

## References

For detailed guidance, see the references folder:
- [Reference 1](./references/example.md) - Description
`;

function getSkillTemplate(target: InstructionTarget, slug: string): string {
  switch (target) {
    case "claude-code":
      return `---\nname: ${slug}\ndescription: Describe what this skill does and when to use it\n---\n\n${SKILL_BODY}`;
    case "google-antigravity":
      return `---\ntrigger: manual\ndescription: Describe when this skill should be activated\n---\n\n${SKILL_BODY}`;
    default:
      return `---\ndescription: Describe when this skill should be activated\nglobs:\nalwaysApply: false\n---\n\n${SKILL_BODY}`;
  }
}

const SKILL_REFERENCE_TEMPLATE = `# Reference Title

Detailed reference content goes here.

## Section 1

Content...

## Section 2

Content...
`;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Path of the main file (or skill directory) for an item in a target. */
function getItemPath(target: InstructionTarget, itemType: ItemType, slug: string): string {
  const directories = getTargetDirectories(target);
  const config = getTargetConfig(target);

  if (itemType === "skill") return join(directories.skillsDir, slug);
  if (itemType === "command")
    return join(directories.commandsDir, `${slug}${config.commandsExtension}`);
  return join(directories.rulesDir, `${slug}${config.rulesExtension}`);
}

function createItem(target: InstructionTarget, itemType: ItemType, slug: string): string {
  const itemPath = getItemPath(target, itemType, slug);

  if (itemType === "skill") {
    const skillFile = target === "cursor" ? "SKILL.mdc" : "SKILL.md";
    ensureDir(join(itemPath, "references"));
    writeFile(join(itemPath, skillFile), getSkillTemplate(target, slug));
    writeFile(join(itemPath, "references", "example.md"), SKILL_REFERENCE_TEMPLATE);
    return join(itemPath, skillFile);
  }

  const template = itemType === "command" ? getCommandTemplate(target) : getRuleTemplate(target);
  writeFile(itemPath, template);
  return itemPath;
}

export const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add a new command, rule, or skill to every configured AI IDE",
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
      description: "Name of the command, rule, or skill",
    },
    target: {
      type: "string",
      description: `Target IDE(s), comma-separated: ${ALL_TARGETS.join(", ")}, or 'dual'. Defaults to the targets saved by init`,
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" fivem-devkit add ")));

    const resolved = await resolveTargets(args.target);
    if (p.isCancel(resolved)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
    const targets = resolved as InstructionTarget[];
    const onlyAntiGravity = targets.length === 1 && targets[0] === "google-antigravity";

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule", "skill"].includes(args.type)) {
      itemType = args.type as ItemType;
    } else {
      const typeResult = await p.select({
        message: "What do you want to add?",
        options: [
          {
            value: "command",
            label: onlyAntiGravity ? "Workflow" : "Command",
            hint: "A reusable prompt template (workflow in AntiGravity)",
          },
          {
            value: "rule",
            label: "Rule",
            hint: "Project-specific AI behavior rules",
          },
          {
            value: "skill",
            label: "Skill",
            hint: "Comprehensive guide with references",
          },
        ],
      });

      if (p.isCancel(typeResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemType = typeResult as ItemType;
    }

    if (args.name) {
      itemName = args.name;
    } else {
      const nameResult = await p.text({
        message: `Enter ${itemType} name:`,
        placeholder: `my-${itemType}`,
        validate: (value) => {
          if (!value.trim()) return "Name is required";
          if (value.length < 2) return "Name must be at least 2 characters";
          return undefined;
        },
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemName = nameResult;
    }

    const slug = generateSlug(itemName);

    const existing = targets.filter((target) => {
      const itemPath = getItemPath(target, itemType, slug);
      return itemType === "skill" ? dirExists(itemPath) : fileExists(itemPath);
    });

    if (existing.length > 0) {
      const shouldOverwrite = await p.confirm({
        message: `${highlight(slug)} already exists in ${formatTargets(existing)}. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    try {
      console.log();
      for (const target of targets) {
        const createdPath = createItem(target, itemType, slug);
        if (target === "claude-code" && itemType === "command") {
          updateClaudeMd(process.cwd());
        }
        console.log(pc.dim(`  ${getTargetConfig(target).label}: `) + highlight(createdPath));
      }
      console.log();

      p.outro(
        pc.green(
          `✨ ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created! Edit the file(s) to customize it.`,
        ),
      );
    } catch (error) {
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
