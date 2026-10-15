import { relative } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import { checkBrain, getBrainDir, scaffoldBrain, writeBrainIndex } from "../utils/brain";
import { highlight, printSuccess } from "../utils/branding";
import { dirExists } from "../utils/fs";

function requireBrain(cwd: string): string {
  const brainDir = getBrainDir(cwd);
  if (!dirExists(brainDir)) {
    p.cancel(`No Second Brain found. Run ${highlight("fdk brain init")} first.`);
    process.exit(1);
  }
  return brainDir;
}

const initSubCommand = defineCommand({
  meta: {
    name: "init",
    description: "Create the Second Brain vault, or add missing standard files (never overwrites)",
  },
  run() {
    const cwd = process.cwd();
    p.intro(pc.bgCyan(pc.black(" fivem-devkit brain init ")));

    const created = scaffoldBrain(cwd);
    const brainDir = getBrainDir(cwd);
    const total = writeBrainIndex(brainDir);

    if (created.length === 0) {
      printSuccess(`${highlight(relative(cwd, brainDir))} already has the standard structure`);
    } else {
      printSuccess(`${created.length} files added to ${highlight(relative(cwd, brainDir))}`);
      for (const file of created) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${file}`));
      }
    }
    console.log(pc.dim(`   INDEX.md rebuilt (${total} notes)`));
    p.outro(pc.green("✨ Second Brain ready"));
  },
});

const indexSubCommand = defineCommand({
  meta: {
    name: "index",
    description: "Rebuild INDEX.md from the frontmatter of every note",
  },
  run() {
    const cwd = process.cwd();
    const brainDir = requireBrain(cwd);
    const total = writeBrainIndex(brainDir);
    printSuccess(`INDEX.md rebuilt with ${highlight(String(total))} notes`);
  },
});

const checkSubCommand = defineCommand({
  meta: {
    name: "check",
    description: "Report notes without frontmatter, stale file references and broken wikilinks",
  },
  run() {
    const cwd = process.cwd();
    const brainDir = requireBrain(cwd);
    const issues = checkBrain(cwd, brainDir);

    if (issues.length === 0) {
      printSuccess("Second Brain is consistent");
      return;
    }

    console.log(pc.yellow(`⚠ ${issues.length} issue(s) in ${relative(cwd, brainDir)}:`));
    for (const issue of issues) {
      console.log(`  ${pc.cyan(issue.note)}: ${issue.message}`);
    }
    process.exitCode = 1;
  },
});

export const brainCommand = defineCommand({
  meta: {
    name: "brain",
    description: "Manage the Second Brain vault (init, index, check)",
  },
  subCommands: {
    init: initSubCommand,
    index: indexSubCommand,
    check: checkSubCommand,
  },
});
