#!/usr/bin/env node
/**
 * Release orchestrator for the CLI + core pair.
 *
 * This keeps package.json as a thin command table while the release sequence
 * stays in one place:
 *   manifest/docs guards -> tests -> pre-release commit -> synchronized bump
 *   -> version check -> version commit -> tag -> push
 */
import { execFileSync, execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(CLI_DIR, "../..");

const RELEASE_TYPES = new Set([
  "patch",
  "minor",
  "major",
  "beta",
  "rc",
  "promote",
]);

function fail(message) {
  console.error(`x ${message}`);
  process.exit(1);
}

function run(command, options = {}) {
  execSync(command, {
    cwd: options.cwd ?? CLI_DIR,
    env: process.env,
    stdio: options.capture ? ["pipe", "pipe", "pipe"] : "inherit",
    encoding: "utf-8",
  });
}

function output(command, options = {}) {
  return execSync(command, {
    cwd: options.cwd ?? CLI_DIR,
    env: process.env,
    stdio: ["pipe", "pipe", "pipe"],
    encoding: "utf-8",
  }).trim();
}

function runGit(args) {
  execFileSync("git", args, {
    cwd: REPO_ROOT,
    env: process.env,
    stdio: "inherit",
    encoding: "utf-8",
  });
}

function hasGitDiff() {
  try {
    execFileSync("git", ["diff-index", "--quiet", "HEAD"], {
      cwd: REPO_ROOT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return false;
  } catch {
    return true;
  }
}

function docsGuard(type) {
  if (type === "beta" || type === "rc" || type === "promote") {
    run(`node scripts/check-docs-changelog.js --type ${type}`);
  }
}

function pushTarget(type) {
  return type === "beta" || type === "rc" ? "HEAD" : "main";
}

function main() {
  const [type = "patch"] = process.argv.slice(2);
  if (!RELEASE_TYPES.has(type)) {
    fail(`usage: release.js <patch|minor|major|beta|rc|promote>`);
  }

  run("node scripts/check-manifest-continuity.js");
  docsGuard(type);
  run("pnpm --filter psymoth-core test");
  run("pnpm test");

  runGit(["add", "-A", "--", ".", ":(exclude)docs-site", ":(exclude)marketplace"]);
  if (hasGitDiff()) {
    runGit(["commit", "-m", "chore: pre-release updates"]);
  }

  const version = output(`node scripts/bump-versions.js ${type}`);
  run("node scripts/release-preflight.js check-versions");
  runGit(["add", "packages/cli/package.json", "packages/core/package.json"]);
  runGit(["commit", "-m", version]);
  runGit(["tag", `v${version}`]);
  runGit(["push", "origin", pushTarget(type)]);
  runGit(["push", "origin", `v${version}`]);
}

main();
