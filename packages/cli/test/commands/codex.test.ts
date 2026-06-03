import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCodexLaunchPlan,
  buildSkillsConfigOverride,
  loadCodexSkillExclusions,
  runCodexLauncher,
} from "../../src/commands/codex.js";
import { runCodexSkillsCommand } from "../../src/commands/codex-skills.js";

let tmpDir: string;
let originalCwd: string;
let originalExitCode: string | number | undefined;

function writeConfig(content: string): void {
  const trellisDir = path.join(tmpDir, ".trellis");
  fs.mkdirSync(trellisDir, { recursive: true });
  fs.writeFileSync(path.join(trellisDir, "config.yaml"), content, "utf-8");
}

function writeTrellisProject(): void {
  fs.mkdirSync(path.join(tmpDir, ".trellis"), { recursive: true });
}

function writeCodexProjectConfig(content: string): void {
  const codexDir = path.join(tmpDir, ".codex");
  fs.mkdirSync(codexDir, { recursive: true });
  fs.writeFileSync(path.join(codexDir, "config.toml"), content, "utf-8");
}

function readCodexProjectConfig(): string {
  return fs.readFileSync(path.join(tmpDir, ".codex", "config.toml"), "utf-8");
}

function writeUserCodexConfig(homeDir: string, content: string): void {
  const userCodexDir = path.join(homeDir, ".codex");
  fs.mkdirSync(userCodexDir, { recursive: true });
  fs.writeFileSync(path.join(userCodexDir, "config.toml"), content, "utf-8");
}

function runSkills(
  args: string[],
  options: { homeDir?: string; env?: NodeJS.ProcessEnv } = {},
): { stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  runCodexSkillsCommand(args, {
    cwd: tmpDir,
    homeDir: options.homeDir,
    env: options.env,
    stdout: (message) => stdout.push(message),
    stderr: (message) => stderr.push(message),
  });
  return { stdout, stderr };
}

beforeEach(() => {
  originalCwd = process.cwd();
  originalExitCode = process.exitCode;
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "trellis-codex-test-"));
});

afterEach(() => {
  process.chdir(originalCwd);
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("loadCodexSkillExclusions", () => {
  it("loads disabled Codex skills by name and path from config.yaml", () => {
    writeConfig(`
session_commit_message: "chore: record journal"

codex:
  dispatch_mode: inline
  disabled_skills:
    - grill-me
    - "global-helper"
    - grill-me
  disabled_skill_paths:
    - D:/Users/Kun/.agents/skills/grill-me/SKILL.md
`);

    expect(loadCodexSkillExclusions(tmpDir)).toEqual({
      disabledSkills: ["grill-me", "global-helper"],
      disabledSkillPaths: ["D:/Users/Kun/.agents/skills/grill-me/SKILL.md"],
    });
  });

  it("returns empty exclusions when Trellis config is missing", () => {
    expect(loadCodexSkillExclusions(tmpDir)).toEqual({
      disabledSkills: [],
      disabledSkillPaths: [],
    });
  });

  it("handles UTF-8 BOM config files written by Windows editors", () => {
    writeConfig("\uFEFFcodex:\n  disabled_skills:\n    - grill-me\n");

    expect(loadCodexSkillExclusions(tmpDir).disabledSkills).toEqual([
      "grill-me",
    ]);
  });
});

describe("buildSkillsConfigOverride", () => {
  it("builds session-level Codex skills.config entries", () => {
    const override = buildSkillsConfigOverride({
      disabledSkills: ["grill-me"],
      disabledSkillPaths: [
        "D:\\Users\\Kun\\.agents\\skills\\grill-me\\SKILL.md",
      ],
    });

    expect(override).toBe(
      'skills.config=[{name="grill-me",enabled=false},{path="D:\\\\Users\\\\Kun\\\\.agents\\\\skills\\\\grill-me\\\\SKILL.md",enabled=false}]',
    );
  });

  it("returns null when no skills are excluded", () => {
    expect(
      buildSkillsConfigOverride({
        disabledSkills: [],
        disabledSkillPaths: [],
      }),
    ).toBeNull();
  });
});

describe("buildCodexLaunchPlan", () => {
  it("passes Codex args through unchanged when no exclusions are configured", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["exec", "--model", "gpt-5"] },
      { disabledSkills: [], disabledSkillPaths: [] },
      "linux",
    );

    expect(plan).toEqual({
      command: "codex",
      args: ["exec", "--model", "gpt-5"],
      spawnOptions: { stdio: "inherit", shell: false },
      skillsConfigOverride: null,
    });
  });

  it("prepends Trellis skills.config before passthrough Codex args", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["--model", "gpt-5"] },
      { disabledSkills: ["grill-me"], disabledSkillPaths: [] },
      "linux",
    );

    expect(plan.args).toEqual([
      "-c",
      'skills.config=[{name="grill-me",enabled=false}]',
      "--model",
      "gpt-5",
    ]);
  });

  it("uses cmd.exe on Windows so npm command shims can launch", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["exec", "hello"] },
      { disabledSkills: ["grill-me"], disabledSkillPaths: [] },
      "win32",
    );

    expect(plan).toEqual({
      command: "cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "codex",
        "-c",
        'skills.config=[{name="grill-me",enabled=false}]',
        "exec",
        "hello",
      ],
      spawnOptions: { stdio: "inherit", shell: false },
      skillsConfigOverride: 'skills.config=[{name="grill-me",enabled=false}]',
    });
  });
});

describe("runCodexLauncher", () => {
  it("launches Codex with project-scoped skill exclusions", async () => {
    writeConfig(`
codex:
  disabled_skills:
    - grill-me
`);
    process.chdir(tmpDir);
    const runner = vi.fn(() => ({ status: 0, signal: null }));

    await runCodexLauncher({ args: ["exec", "hello"] }, runner);

    const expectedPlan = buildCodexLaunchPlan(
      { args: ["exec", "hello"] },
      { disabledSkills: ["grill-me"], disabledSkillPaths: [] },
    );
    expect(runner).toHaveBeenCalledWith(
      expectedPlan.command,
      expectedPlan.args,
      expectedPlan.spawnOptions,
    );
  });

  it("requires a Trellis project", async () => {
    process.chdir(tmpDir);
    const runner = vi.fn(() => ({ status: 0, signal: null }));

    await expect(runCodexLauncher({}, runner)).rejects.toThrow(
      /No \.trellis\/ directory/,
    );
    expect(runner).not.toHaveBeenCalled();
  });
});

describe("runCodexSkillsCommand", () => {
  it("#1 disables and restores a skill by name in project Codex config", () => {
    writeTrellisProject();
    writeCodexProjectConfig(`# keep me
project_doc_fallback_filenames = ["AGENTS.md"]
`);

    runSkills(["disable", "--name", "trellis-break-loop"]);

    expect(readCodexProjectConfig()).toBe(`# keep me
project_doc_fallback_filenames = ["AGENTS.md"]

[skills]
config = [
  { name = "trellis-break-loop", enabled = false },
]
`);

    runSkills(["restore", "--name", "trellis-break-loop"]);

    expect(readCodexProjectConfig()).toBe(`# keep me
project_doc_fallback_filenames = ["AGENTS.md"]

[skills]
`);
  });

  it("#2 keeps disable idempotent and collapses duplicate matching entries", () => {
    writeTrellisProject();
    writeCodexProjectConfig(`[skills]
config = [
  { name = "trellis-break-loop", enabled = false },
  { name = "other", enabled = false },
  { name = "trellis-break-loop", enabled = true },
]
`);

    runSkills(["disable", "--name", "trellis-break-loop"]);

    expect(readCodexProjectConfig()).toBe(`[skills]
config = [
  { name = "other", enabled = false },
  { name = "trellis-break-loop", enabled = false },
]
`);
  });

  it("#3 supports path selectors with project-relative normalization", () => {
    writeTrellisProject();
    writeCodexProjectConfig("");
    const skillFile = path.join(tmpDir, ".agents", "skills", "foo", "SKILL.md");
    fs.mkdirSync(path.dirname(skillFile), { recursive: true });
    fs.writeFileSync(skillFile, "# Foo\n", "utf-8");

    runSkills(["disable", "--path", ".agents\\skills\\foo\\SKILL.md"]);

    expect(readCodexProjectConfig()).toBe(`[skills]
config = [
  { path = ".agents/skills/foo/SKILL.md", enabled = false },
]
`);
  });

  it("#4 warns for project-external path selectors without failing", () => {
    writeTrellisProject();
    writeCodexProjectConfig("");
    const externalSkill = path.join(
      os.tmpdir(),
      "trellis-external-skill",
      "SKILL.md",
    );

    const output = runSkills(["disable", "--path", externalSkill]);

    expect(readCodexProjectConfig()).toContain(
      `{ path = ${JSON.stringify(path.normalize(externalSkill))}, enabled = false }`,
    );
    expect(output.stderr.join("\n")).toContain("machine-specific");
  });

  it("#5 dry-run reports the change without writing the config file", () => {
    writeTrellisProject();
    writeCodexProjectConfig("[skills]\n");
    const before = readCodexProjectConfig();

    const output = runSkills(["disable", "--name", "foo", "--dry-run"]);

    expect(readCodexProjectConfig()).toBe(before);
    expect(output.stdout.join("\n")).toContain("Would disable name:foo");
  });

  it("#6 creates a minimal config only when disable receives --create", () => {
    writeTrellisProject();

    expect(() => runSkills(["disable", "--name", "foo"])).toThrow(
      /No \.codex\/config\.toml/,
    );

    runSkills(["disable", "--name", "foo", "--create"]);

    expect(readCodexProjectConfig())
      .toBe(`# Project-scoped Codex skill config managed by Trellis.

[skills]
config = [
  { name = "foo", enabled = false },
]
`);
  });

  it("#7 lists project-level disabled skills", () => {
    writeTrellisProject();
    writeCodexProjectConfig(`[skills]
config = [
  { name = "foo", enabled = false },
  { path = ".agents/skills/bar/SKILL.md", enabled = false },
  { name = "enabled-helper", enabled = true },
]
`);

    const output = runSkills(["list"]);

    expect(output.stdout).toEqual([
      "Project-level Codex skill disables:",
      "- name:foo",
      "- path:.agents/skills/bar/SKILL.md",
    ]);
  });

  it("#8 reports status and trust state for a selector", () => {
    writeTrellisProject();
    writeCodexProjectConfig(`[skills]
config = [
  { name = "foo", enabled = false },
]
`);
    const homeDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "trellis-codex-home-"),
    );
    try {
      writeUserCodexConfig(
        homeDir,
        `[projects.${JSON.stringify(tmpDir)}]
trust_level = "trusted"
`,
      );

      const output = runSkills(["status", "--name", "foo"], { homeDir });

      expect(output.stdout).toEqual([
        "name:foo: disabled",
        "Project trust: trusted",
      ]);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  });

  it("#9 warns but still writes when the project is not trusted", () => {
    writeTrellisProject();
    writeCodexProjectConfig("");
    const homeDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "trellis-codex-home-"),
    );
    try {
      const output = runSkills(["disable", "--name", "foo"], { homeDir });

      expect(readCodexProjectConfig()).toContain(
        '{ name = "foo", enabled = false }',
      );
      expect(output.stderr.join("\n")).toContain(
        "will not merge this project config",
      );
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  });

  it("#10 refuses to write under --require-trusted when the project is not trusted", () => {
    writeTrellisProject();
    writeCodexProjectConfig("");
    const before = readCodexProjectConfig();
    const homeDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "trellis-codex-home-"),
    );
    try {
      expect(() =>
        runSkills(["disable", "--name", "foo", "--require-trusted"], {
          homeDir,
        }),
      ).toThrow(/not trusted/);
      expect(readCodexProjectConfig()).toBe(before);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  });

  it("#11 rejects ambiguous selectors", () => {
    writeTrellisProject();
    writeCodexProjectConfig("");

    expect(() =>
      runSkills(["disable", "--name", "foo", "--path", ".agents/skills/foo"]),
    ).toThrow(/exactly one selector/);
  });

  it("#12 rejects unsupported skills.config shapes instead of rewriting them", () => {
    writeTrellisProject();
    writeCodexProjectConfig(`[skills]
config = "not an array"
`);

    expect(() => runSkills(["disable", "--name", "foo"])).toThrow(
      /skills\.config must be an array/,
    );
  });

  it("#13 rejects duplicate skills.config assignments", () => {
    writeTrellisProject();
    writeCodexProjectConfig(`[skills]
config = [
  { name = "foo", enabled = false },
]
config = [
  { name = "bar", enabled = false },
]
`);

    expect(() => runSkills(["disable", "--name", "baz"])).toThrow(
      /duplicate skills\.config assignments/,
    );
  });

  it("#14 rejects duplicate keys inside skills.config entries", () => {
    writeTrellisProject();
    writeCodexProjectConfig(`[skills]
config = [
  { name = "foo", name = "bar", enabled = false },
]
`);

    expect(() => runSkills(["disable", "--name", "baz"])).toThrow(
      /duplicate skills\.config key "name"/,
    );
  });

  it("#15 requires a Trellis project", () => {
    writeCodexProjectConfig("");

    expect(() => runSkills(["list"])).toThrow(/No \.trellis\/ directory/);
  });
});
