import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { downloadTemplate } from "giget";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { copyBrainTemplates, getBrainDir } from "../utils/brain";
import { highlight, printDivider, printSuccess } from "../utils/branding";
import { REPO_REF, REPO_URL } from "../utils/constants";
import { dirExists, removeFile } from "../utils/fs";
import {
  type TargetInstallResult,
  type TemplateSelection,
  applyTargetProfile,
  ensureAgentBoard,
  installForTarget,
  needsAgentBoard,
} from "../utils/install";
import {
  ALL_TARGETS,
  formatTargets,
  getTargetConfig,
  resolveTargets,
  saveTargets,
} from "../utils/target";
import { fetchTemplateManifest, setTemplatesSource } from "../utils/templates";

export const pullCommand = defineCommand({
  meta: {
    name: "pull",
    description: "Pull latest updates from fivem-devkit repository into every configured AI IDE",
  },
  args: {
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only pull commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only pull rules",
      default: false,
    },
    skills: {
      type: "boolean",
      alias: "s",
      description: "Only pull skills",
      default: false,
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Force overwrite without confirmation",
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
      description: `Target IDE(s), comma-separated: ${ALL_TARGETS.join(", ")}, or 'dual'. Defaults to the targets saved by init`,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const pullAll = !args.commands && !args.rules && !args.skills;

    p.intro(pc.bgCyan(pc.black(" fivem-devkit pull ")));

    const resolved = await resolveTargets(args.target, cwd);
    if (p.isCancel(resolved)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
    const targets = resolved as InstructionTarget[];

    p.log.info(`Targets: ${highlight(formatTargets(targets))}`);

    if (!args.force) {
      const shouldContinue = await p.confirm({
        message:
          "This will overwrite DevKit files with the latest version (your extra files are kept). Continue?",
        initialValue: true,
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    const s = p.spinner();
    const downloadDir = mkdtempSync(join(tmpdir(), "fivem-devkit-"));

    try {
      s.start("Downloading latest templates...");
      await downloadTemplate(`${REPO_URL}/templates#${REPO_REF}`, {
        dir: downloadDir,
        force: true,
      });
      setTemplatesSource(downloadDir);
      const manifest = await fetchTemplateManifest();
      s.stop("Templates downloaded");

      const selection: TemplateSelection = {
        commands: pullAll || args.commands ? manifest.commands : [],
        rules: pullAll || args.rules ? manifest.rules : [],
        skills: pullAll || args.skills ? manifest.skills : [],
      };

      if (needsAgentBoard(targets, selection)) {
        ensureAgentBoard(cwd);
      }

      // Note templates belong to the kit; notes themselves are never touched
      if (dirExists(getBrainDir(cwd))) {
        copyBrainTemplates(cwd);
      }

      const results: TargetInstallResult[] = [];
      for (const target of targets) {
        const label = getTargetConfig(target).label;
        s.start(`Updating ${label}...`);
        const targetSelection = args.full
          ? selection
          : applyTargetProfile(target, selection, manifest).selection;
        results.push(await installForTarget(target, cwd, targetSelection, "overwrite"));
        s.stop(`${label} updated`);
      }

      saveTargets(targets, cwd);

      printDivider();
      console.log();

      for (const result of results) {
        const config = getTargetConfig(result.target);
        printSuccess(
          `${highlight(config.label)}: ${result.commands.length} ${config.commandsLabel}, ` +
            `${result.rules.length} ${config.rulesLabel}, ${result.skills.length} skills`,
        );
      }

      console.log();
      p.outro(pc.green(`✨ Successfully pulled latest updates for ${formatTargets(targets)}!`));
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    } finally {
      setTemplatesSource(null);
      removeFile(downloadDir);
    }
  },
});
