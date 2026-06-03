import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";

type SelectorKind = "name" | "path";
type SkillsAction = "disable" | "restore" | "list" | "status";

interface SkillSelector {
  kind: SelectorKind;
  value: string;
  machineSpecific: boolean;
  pathExists: boolean | null;
}

interface ParsedSkillEntry {
  selector: SkillSelector;
  enabled: boolean;
}

interface ConfigBlock {
  tableStart: number;
  tableEnd: number;
  configStart: number;
  configEnd: number;
  lineIndent: string;
  entries: ParsedSkillEntry[];
}

interface SkillsTable {
  start: number;
  end: number;
}

interface CodexConfigModel {
  content: string;
  skillsTable: SkillsTable | null;
  configBlock: ConfigBlock | null;
}

interface ParsedArgs {
  action: SkillsAction;
  selector: SkillSelector | null;
  dryRun: boolean;
  create: boolean;
  requireTrusted: boolean;
}

interface TrustStatus {
  trusted: boolean;
  configPath: string;
  reason: string;
}

interface CommandContext {
  cwd: string;
  env: NodeJS.ProcessEnv;
  homeDir: string;
  stdout: (message: string) => void;
  stderr: (message: string) => void;
}

export interface RunCodexSkillsOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  homeDir?: string;
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

const CODEX_CONFIG_RELATIVE_PATH = path.join(".codex", "config.toml");

function defaultContext(options: RunCodexSkillsOptions = {}): CommandContext {
  return {
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    homeDir: options.homeDir ?? os.homedir(),
    stdout: options.stdout ?? ((message: string): void => console.log(message)),
    stderr:
      options.stderr ?? ((message: string): void => console.error(message)),
  };
}

function isFlag(value: string | undefined): boolean {
  return value?.startsWith("--") ?? false;
}

function readFlagValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (value === undefined || isFlag(value)) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function isPathInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function toPosixRelative(value: string): string {
  return value.split(path.sep).join("/");
}

function normalizePathSelector(input: string, cwd: string): SkillSelector {
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new Error("--path requires a non-empty value.");
  }

  const absolutePath = path.resolve(cwd, trimmed);
  const exists = fs.existsSync(absolutePath);
  if (isPathInside(cwd, absolutePath)) {
    return {
      kind: "path",
      value: toPosixRelative(path.relative(cwd, absolutePath)),
      machineSpecific: false,
      pathExists: exists,
    };
  }

  return {
    kind: "path",
    value: path.normalize(absolutePath),
    machineSpecific: true,
    pathExists: exists,
  };
}

function normalizeExistingPathSelector(
  value: string,
  cwd: string,
): SkillSelector {
  if (path.isAbsolute(value)) {
    const absolutePath = path.normalize(value);
    return {
      kind: "path",
      value: isPathInside(cwd, absolutePath)
        ? toPosixRelative(path.relative(cwd, absolutePath))
        : absolutePath,
      machineSpecific: !isPathInside(cwd, absolutePath),
      pathExists: fs.existsSync(absolutePath),
    };
  }

  const absolutePath = path.resolve(cwd, value);
  return {
    kind: "path",
    value: isPathInside(cwd, absolutePath)
      ? toPosixRelative(path.relative(cwd, absolutePath))
      : path.normalize(absolutePath),
    machineSpecific: !isPathInside(cwd, absolutePath),
    pathExists: fs.existsSync(absolutePath),
  };
}

function normalizeNameSelector(input: string): SkillSelector {
  const value = input.trim();
  if (value === "") {
    throw new Error("--name requires a non-empty value.");
  }
  return {
    kind: "name",
    value,
    machineSpecific: false,
    pathExists: null,
  };
}

function parseArgs(args: string[], cwd: string): ParsedArgs {
  const [actionArg, ...rest] = args;
  const action =
    actionArg === "enable"
      ? "restore"
      : (actionArg as SkillsAction | undefined);
  if (
    action !== "disable" &&
    action !== "restore" &&
    action !== "list" &&
    action !== "status"
  ) {
    throw new Error(
      "Usage: trellis codex skills <disable|restore|enable|list|status> [--name <skill> | --path <path>] [--dry-run] [--create] [--require-trusted]",
    );
  }

  let name: string | null = null;
  let skillPath: string | null = null;
  let dryRun = false;
  let create = false;
  let requireTrusted = false;

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--name") {
      name = readFlagValue(rest, i, "--name");
      i += 1;
      continue;
    }
    if (arg === "--path") {
      skillPath = readFlagValue(rest, i, "--path");
      i += 1;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--create") {
      create = true;
      continue;
    }
    if (arg === "--require-trusted") {
      requireTrusted = true;
      continue;
    }
    throw new Error(`Unknown codex skills option: ${arg}`);
  }

  if (name !== null && skillPath !== null) {
    throw new Error("Use exactly one selector: --name or --path, not both.");
  }

  const selector =
    name !== null
      ? normalizeNameSelector(name)
      : skillPath !== null
        ? normalizePathSelector(skillPath, cwd)
        : null;

  if (
    (action === "disable" || action === "restore" || action === "status") &&
    selector === null
  ) {
    throw new Error(`${action} requires --name <skill> or --path <path>.`);
  }
  if (action === "list" && selector !== null) {
    throw new Error("list does not accept --name or --path.");
  }

  return { action, selector, dryRun, create, requireTrusted };
}

function parseTableName(line: string): string | null {
  const match = line.match(/^\s*\[([^\]]+)\]\s*(?:#.*)?$/);
  return match?.[1]?.trim() ?? null;
}

function findSkillsTable(content: string): SkillsTable | null {
  const lineStartRe = /^/gm;
  const starts = [...content.matchAll(lineStartRe)].map((match) => match.index);
  let table: SkillsTable | null = null;

  for (const start of starts) {
    const lineEnd = content.indexOf("\n", start);
    const end = lineEnd === -1 ? content.length : lineEnd + 1;
    const line = content.slice(start, end);
    const tableName = parseTableName(line);
    if (tableName === null) {
      continue;
    }
    if (tableName === "skills") {
      if (table !== null) {
        throw new Error(
          "Unsupported .codex/config.toml: duplicate [skills] tables.",
        );
      }
      table = { start, end: content.length };
      continue;
    }
    if (table !== null && start > table.start) {
      table.end = start;
      break;
    }
  }

  return table;
}

function findArrayEnd(content: string, openBracket: number): number {
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;
  let inComment = false;

  for (let i = openBracket; i < content.length; i += 1) {
    const char = content[i];
    if (inComment) {
      if (char === "\n") {
        inComment = false;
      }
      continue;
    }
    if (quote !== null) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (quote === '"' && char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "#") {
      inComment = true;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[") {
      depth += 1;
      continue;
    }
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return i + 1;
      }
    }
  }

  throw new Error(
    "Unsupported .codex/config.toml: skills.config array is not closed.",
  );
}

function findLineStart(content: string, index: number): number {
  const previousNewline = content.lastIndexOf("\n", index);
  return previousNewline === -1 ? 0 : previousNewline + 1;
}

function findLineEnd(content: string, index: number): number {
  const nextNewline = content.indexOf("\n", index);
  return nextNewline === -1 ? content.length : nextNewline + 1;
}

function findConfigBlock(
  content: string,
  table: SkillsTable,
  cwd: string,
): ConfigBlock | null {
  const tableContent = content.slice(table.start, table.end);
  const configAssignments = [...tableContent.matchAll(/^(\s*)config\s*=/gm)];
  if (configAssignments.length > 1) {
    throw new Error(
      "Unsupported .codex/config.toml: duplicate skills.config assignments.",
    );
  }

  const match = tableContent.match(/^(\s*)config\s*=\s*\[/m);
  if (match?.index === undefined) {
    if (/^\s*config\s*=/m.test(tableContent)) {
      throw new Error(
        "Unsupported .codex/config.toml: skills.config must be an array.",
      );
    }
    return null;
  }

  const absoluteMatchIndex = table.start + match.index;
  const openBracket = content.indexOf("[", absoluteMatchIndex);
  const arrayEnd = findArrayEnd(content, openBracket);
  const configStart = findLineStart(content, absoluteMatchIndex);
  const configEnd = findLineEnd(content, arrayEnd);
  const entries = parseEntries(
    content.slice(openBracket + 1, arrayEnd - 1),
    cwd,
  );

  return {
    tableStart: table.start,
    tableEnd: table.end,
    configStart,
    configEnd,
    lineIndent: match[1] ?? "",
    entries,
  };
}

function parseConfigModel(content: string, cwd: string): CodexConfigModel {
  const skillsTable = findSkillsTable(content);
  if (skillsTable === null) {
    return { content, skillsTable: null, configBlock: null };
  }

  return {
    content,
    skillsTable,
    configBlock: findConfigBlock(content, skillsTable, cwd),
  };
}

function splitTopLevelEntries(content: string): string[] {
  const entries: string[] = [];
  let start = -1;
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;
  let inComment = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (inComment) {
      if (char === "\n") {
        inComment = false;
      }
      continue;
    }
    if (quote !== null) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (quote === '"' && char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "#") {
      inComment = true;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "{") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }
    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        entries.push(content.slice(start, i + 1));
        start = -1;
      }
      if (depth < 0) {
        throw new Error(
          "Unsupported .codex/config.toml: malformed inline table.",
        );
      }
    }
  }

  if (depth !== 0 || quote !== null) {
    throw new Error(
      "Unsupported .codex/config.toml: malformed skills.config entry.",
    );
  }

  const leftover = content
    .replace(/\{(?:[^"'{}#]|"(?:\\.|[^"\\])*"|'[^']*'|#.*$)*\}/gm, "")
    .replace(/#.*$/gm, "")
    .replace(/[,\s]/g, "");
  if (leftover !== "") {
    throw new Error(
      "Unsupported .codex/config.toml: skills.config contains non-entry content.",
    );
  }

  return entries;
}

function splitFields(content: string): string[] {
  const fields: string[] = [];
  let start = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (quote !== null) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (quote === '"' && char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === ",") {
      fields.push(content.slice(start, i).trim());
      start = i + 1;
    }
  }

  fields.push(content.slice(start).trim());
  return fields.filter((field) => field !== "");
}

function parseTomlString(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed) as string;
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  throw new Error(
    "Unsupported .codex/config.toml: selector values must be strings.",
  );
}

function parseEntry(raw: string, cwd: string): ParsedSkillEntry {
  const inner = raw.trim().replace(/^\{/, "").replace(/\}$/, "");
  const fields = new Map<string, string>();
  for (const field of splitFields(inner)) {
    const eq = field.indexOf("=");
    if (eq === -1) {
      throw new Error(
        "Unsupported .codex/config.toml: malformed skills.config field.",
      );
    }
    const key = field.slice(0, eq).trim();
    const value = field.slice(eq + 1).trim();
    if (fields.has(key)) {
      throw new Error(
        `Unsupported .codex/config.toml: duplicate skills.config key "${key}".`,
      );
    }
    fields.set(key, value);
  }

  const name = fields.get("name");
  const skillPath = fields.get("path");
  if (
    (name === undefined && skillPath === undefined) ||
    (name !== undefined && skillPath !== undefined)
  ) {
    throw new Error(
      "Unsupported .codex/config.toml: each skills.config entry needs exactly one name or path.",
    );
  }

  const enabledRaw = fields.get("enabled");
  if (enabledRaw !== "true" && enabledRaw !== "false") {
    throw new Error(
      "Unsupported .codex/config.toml: skills.config entries need enabled=true/false.",
    );
  }

  const allowedKeys = new Set(["name", "path", "enabled"]);
  for (const key of fields.keys()) {
    if (!allowedKeys.has(key)) {
      throw new Error(
        `Unsupported .codex/config.toml: unknown skills.config key "${key}".`,
      );
    }
  }

  return {
    selector:
      name !== undefined
        ? normalizeNameSelector(parseTomlString(name))
        : normalizeExistingPathSelector(parseTomlString(skillPath ?? ""), cwd),
    enabled: enabledRaw === "true",
  };
}

function parseEntries(content: string, cwd: string): ParsedSkillEntry[] {
  return splitTopLevelEntries(content).map((entry) => parseEntry(entry, cwd));
}

function selectorsEqual(left: SkillSelector, right: SkillSelector): boolean {
  return left.kind === right.kind && left.value === right.value;
}

function renderTomlString(value: string): string {
  return JSON.stringify(value);
}

function renderEntry(entry: ParsedSkillEntry, indent: string): string {
  const key = entry.selector.kind;
  return `${indent}  { ${key} = ${renderTomlString(entry.selector.value)}, enabled = ${
    entry.enabled ? "true" : "false"
  } },`;
}

function renderConfigBlock(
  entries: ParsedSkillEntry[],
  indent: string,
): string {
  if (entries.length === 0) {
    return "";
  }

  const lines = [
    `${indent}config = [`,
    ...entries.map((entry) => renderEntry(entry, indent)),
    `${indent}]`,
  ];
  return `${lines.join("\n")}\n`;
}

function withUniqueSelectorEntries(
  entries: ParsedSkillEntry[],
): ParsedSkillEntry[] {
  const result: ParsedSkillEntry[] = [];
  for (const entry of entries) {
    const index = result.findIndex((existing) =>
      selectorsEqual(existing.selector, entry.selector),
    );
    if (index >= 0) {
      result.splice(index, 1);
    }
    result.push(entry);
  }
  return result;
}

function updateContentForSelector(
  model: CodexConfigModel,
  selector: SkillSelector,
  action: "disable" | "restore",
): string {
  const existingEntries = model.configBlock?.entries ?? [];
  const withoutTarget = existingEntries.filter(
    (entry) => !selectorsEqual(entry.selector, selector),
  );
  const nextEntries =
    action === "disable"
      ? withUniqueSelectorEntries([
          ...withoutTarget,
          { selector, enabled: false },
        ])
      : withUniqueSelectorEntries(withoutTarget);

  if (model.configBlock !== null) {
    return (
      model.content.slice(0, model.configBlock.configStart) +
      renderConfigBlock(nextEntries, model.configBlock.lineIndent) +
      model.content.slice(model.configBlock.configEnd)
    );
  }

  const block = renderConfigBlock(nextEntries, "");
  if (model.skillsTable !== null) {
    const tableContent = model.content.slice(
      model.skillsTable.start,
      model.skillsTable.end,
    );
    const tableSeparator = tableContent.endsWith("\n") ? "" : "\n";
    return (
      model.content.slice(0, model.skillsTable.start) +
      tableContent +
      tableSeparator +
      block +
      model.content.slice(model.skillsTable.end)
    );
  }

  const separator =
    model.content.length === 0
      ? ""
      : model.content.endsWith("\n")
        ? "\n"
        : "\n\n";
  return `${model.content}${separator}[skills]\n${block}`;
}

function readProjectCodexConfig(configPath: string): string {
  if (!fs.existsSync(configPath)) {
    throw new Error(
      "No .codex/config.toml found. Run `trellis init --codex` first, or pass --create with disable to create a minimal project config.",
    );
  }
  return fs.readFileSync(configPath, "utf-8").replace(/^\uFEFF/, "");
}

function ensureProjectCodexConfig(configPath: string, create: boolean): string {
  if (fs.existsSync(configPath)) {
    return readProjectCodexConfig(configPath);
  }
  if (!create) {
    return readProjectCodexConfig(configPath);
  }

  return "# Project-scoped Codex skill config managed by Trellis.\n";
}

function writeConfig(
  configPath: string,
  content: string,
  dryRun: boolean,
): void {
  if (dryRun) {
    return;
  }
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, content, "utf-8");
}

function decodeTomlBareString(raw: string): string {
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return JSON.parse(raw) as string;
  }
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1);
  }
  return raw;
}

function normalizeComparablePath(value: string): string {
  const resolved = path.resolve(value);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function parseTrustedProjects(content: string): Map<string, boolean> {
  const result = new Map<string, boolean>();
  const lines = content.split(/\r?\n/);
  let currentProject: string | null = null;

  for (const line of lines) {
    const tableMatch = line.match(
      /^\s*\[projects\.((?:"(?:\\.|[^"\\])*")|'[^']*')\]\s*(?:#.*)?$/,
    );
    if (tableMatch !== null) {
      currentProject = decodeTomlBareString(tableMatch[1] ?? "");
      result.set(currentProject, false);
      continue;
    }

    if (parseTableName(line) !== null) {
      currentProject = null;
      continue;
    }

    if (currentProject !== null) {
      const trustMatch = line.match(
        /^\s*trust_level\s*=\s*["']trusted["']\s*(?:#.*)?$/,
      );
      if (trustMatch !== null) {
        result.set(currentProject, true);
      }
    }
  }

  return result;
}

function getUserCodexConfigPath(context: CommandContext): string {
  const codexHome = context.env.CODEX_HOME;
  if (codexHome !== undefined && codexHome.trim() !== "") {
    return path.join(codexHome, "config.toml");
  }
  return path.join(context.homeDir, ".codex", "config.toml");
}

function getTrustStatus(context: CommandContext): TrustStatus {
  const configPath = getUserCodexConfigPath(context);
  if (!fs.existsSync(configPath)) {
    return {
      trusted: false,
      configPath,
      reason: "user-level Codex config was not found",
    };
  }

  const projects = parseTrustedProjects(fs.readFileSync(configPath, "utf-8"));
  const cwdComparable = normalizeComparablePath(context.cwd);
  for (const [projectPath, trusted] of projects) {
    if (normalizeComparablePath(projectPath) === cwdComparable && trusted) {
      return { trusted: true, configPath, reason: "project is trusted" };
    }
  }

  return {
    trusted: false,
    configPath,
    reason: "project is not marked as trusted",
  };
}

function disabledEntries(entries: ParsedSkillEntry[]): ParsedSkillEntry[] {
  return entries.filter((entry) => !entry.enabled);
}

function selectorLabel(selector: SkillSelector): string {
  return `${selector.kind}:${selector.value}`;
}

function loadModel(configPath: string, cwd: string): CodexConfigModel {
  return parseConfigModel(readProjectCodexConfig(configPath), cwd);
}

function outputTrustWarning(context: CommandContext, trust: TrustStatus): void {
  if (trust.trusted) {
    return;
  }
  context.stderr(
    chalk.yellow(
      `Warning: .codex/config.toml was updated, but ${trust.reason}. Codex App and bare codex will not merge this project config until you add this project to ${trust.configPath}.`,
    ),
  );
}

function outputSelectorWarnings(
  context: CommandContext,
  selector: SkillSelector,
): void {
  if (selector.kind === "path" && selector.machineSpecific) {
    context.stderr(
      chalk.yellow(
        `Warning: ${selector.value} is outside the project and machine-specific; avoid committing it as a team default.`,
      ),
    );
  }
  if (selector.kind === "path" && selector.pathExists === false) {
    context.stderr(
      chalk.yellow(`Warning: path does not currently exist: ${selector.value}`),
    );
  }
}

function runList(configPath: string, context: CommandContext): void {
  const model = loadModel(configPath, context.cwd);
  const entries = disabledEntries(model.configBlock?.entries ?? []);
  if (entries.length === 0) {
    context.stdout("No project-level Codex skill disables configured.");
    return;
  }

  context.stdout("Project-level Codex skill disables:");
  for (const entry of entries) {
    context.stdout(`- ${selectorLabel(entry.selector)}`);
  }
}

function runStatus(
  configPath: string,
  context: CommandContext,
  selector: SkillSelector,
): void {
  const model = loadModel(configPath, context.cwd);
  const matching = (model.configBlock?.entries ?? []).filter((entry) =>
    selectorsEqual(entry.selector, selector),
  );
  const disabled = matching.some((entry) => !entry.enabled);
  const enabledOverride = matching.some((entry) => entry.enabled);
  const trust = getTrustStatus(context);

  context.stdout(
    `${selectorLabel(selector)}: ${disabled ? "disabled" : "not disabled"}`,
  );
  if (enabledOverride) {
    context.stdout(
      "Project config contains an explicit enabled=true override for this selector.",
    );
  }
  context.stdout(
    `Project trust: ${trust.trusted ? "trusted" : `not trusted (${trust.reason})`}`,
  );
  outputSelectorWarnings(context, selector);
}

function runMutation(
  configPath: string,
  context: CommandContext,
  parsed: ParsedArgs & {
    action: "disable" | "restore";
    selector: SkillSelector;
  },
): void {
  const trust = getTrustStatus(context);
  if (parsed.requireTrusted && !trust.trusted) {
    throw new Error(
      `Current project is not trusted in ${trust.configPath}; refusing to write because --require-trusted was set.`,
    );
  }

  const content = ensureProjectCodexConfig(
    configPath,
    parsed.create && parsed.action === "disable",
  );
  const model = parseConfigModel(content, context.cwd);
  const nextContent = updateContentForSelector(
    model,
    parsed.selector,
    parsed.action,
  );
  const changed = nextContent !== content;
  outputSelectorWarnings(context, parsed.selector);

  if (parsed.dryRun) {
    context.stdout(
      `${parsed.action === "disable" ? "Would disable" : "Would restore"} ${selectorLabel(parsed.selector)} in ${configPath}.`,
    );
    if (!changed) {
      context.stdout("No file changes needed.");
    }
    return;
  }

  writeConfig(configPath, nextContent, false);
  context.stdout(
    `${parsed.action === "disable" ? "Disabled" : "Restored"} ${selectorLabel(parsed.selector)} in ${configPath}.`,
  );
  outputTrustWarning(context, trust);
}

export function runCodexSkillsCommand(
  args: string[],
  options: RunCodexSkillsOptions = {},
): void {
  const context = defaultContext(options);
  if (!fs.existsSync(path.join(context.cwd, ".trellis"))) {
    throw new Error("No .trellis/ directory found. Run `trellis init` first.");
  }

  const parsed = parseArgs(args, context.cwd);
  const configPath = path.join(context.cwd, CODEX_CONFIG_RELATIVE_PATH);

  if (parsed.action === "list") {
    runList(configPath, context);
    return;
  }
  if (parsed.action === "status") {
    runStatus(configPath, context, parsed.selector as SkillSelector);
    return;
  }
  runMutation(configPath, context, {
    ...parsed,
    action: parsed.action,
    selector: parsed.selector as SkillSelector,
  });
}
