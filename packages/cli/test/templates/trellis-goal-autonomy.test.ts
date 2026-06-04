import { describe, expect, it } from "vitest";
import {
  getBundledSkillTemplates,
  type CommonBundledSkill,
} from "../../src/templates/common/index.js";
import { workflowMdTemplate } from "../../src/templates/trellis/index.js";

function trellisGoalSkill(): CommonBundledSkill {
  const skill = getBundledSkillTemplates().find(
    (candidate) => candidate.name === "trellis-goal",
  );
  if (!skill) {
    throw new Error("trellis-goal bundled skill must exist");
  }
  return skill;
}

function trellisGoalFile(relativePath: string): string {
  const file = trellisGoalSkill().files.find(
    (candidate) => candidate.relativePath === relativePath,
  );
  if (!file) {
    throw new Error(`trellis-goal file must exist: ${relativePath}`);
  }
  return file.content;
}

function trellisGoalBundleContent(): string {
  return trellisGoalSkill()
    .files.map((file) => `--- ${file.relativePath} ---\n${file.content}`)
    .join("\n");
}

function workflowStateBreadcrumb(status: string): string {
  const match = new RegExp(
    `^\\[workflow-state:${status}\\]\\r?\\n([\\s\\S]*?)^\\[/workflow-state:${status}\\]`,
    "m",
  ).exec(workflowMdTemplate);
  if (!match) {
    throw new Error(`${status} breadcrumb block must exist in workflow.md`);
  }
  return match[1];
}

describe("trellis-goal delegated autonomy template contract", () => {
  it("bundled trellis-goal files contain delegated-autonomy load-bearing sections", () => {
    const bundle = trellisGoalBundleContent();

    for (const phrase of [
      "Autonomy Charter",
      "Frozen Invariants",
      "Decision Harness",
      "Autonomous Research Protocol",
      "Evidence Chain",
      "Stop/Block",
    ]) {
      expect(bundle, `missing ${phrase}`).toContain(phrase);
    }
  });

  it("workflow goal overrides route active goals through autonomous research, grill, and evidence updates", () => {
    for (const status of ["in_progress", "in_progress-inline"]) {
      const block = workflowStateBreadcrumb(status);

      expect(block).toContain("Goal execution override");
      expect(block).toMatch(
        /autonomous research|Autonomous Research Protocol|autonomously through approved research/i,
      );
      expect(block).toContain("trellis-grill-agents");
      expect(block).toMatch(/Evidence Chain/i);
      expect(block).toMatch(/Codex native goal (?:state|ownership)|Codex owns/i);
      expect(block).toMatch(
        /`implement\.md` checkpoints.*evidence\/recovery landmarks/i,
      );
      expect(block).toMatch(/rather than a local queue|not a local queue/i);
    }
  });

  it("keeps hard rules against adding a second goal lifecycle or runner", () => {
    const skill = trellisGoalFile("SKILL.md");
    const taskMapping = trellisGoalFile("references/task-mapping.md");

    expect(skill).toContain("Do not add a new `task.json.status`");
    expect(skill).toContain("checkpoint queue file");
    expect(skill).toContain("runtime mailbox");
    expect(skill).toContain("durable source of truth");
    expect(skill).toContain("Do not create or continue standalone `goals/<id>`");
    expect(taskMapping).toContain("Do not create another goal directory");
    expect(taskMapping).toContain("checkpoint queue");
    expect(taskMapping).toContain("local scheduler");
    expect(taskMapping).toContain("fan-out native-goal runtime");
  });

  it("does not use positive second-lifecycle or local-runner language outside prohibition lines", () => {
    const relevantFiles = new Set([
      "SKILL.md",
      "references/ambiguity-handling.md",
      "references/goal-contract.md",
      "references/prd-mapping.md",
      "references/task-mapping.md",
      "references/trellis-goal-protocol.md",
    ]);
    const prohibitionLine = /\b(?:do not|don't|must not|never|not a|not an|not automatically|no new|no second|out of scope|without adding|does not|is not)\b/i;
    const secondLifecyclePatterns: { label: string; pattern: RegExp }[] = [
      {
        label: "task.json.status writer",
        pattern: /\b(?:add|create|write|set|introduce|persist|store)\b.*\btask\.json\.status\b/i,
      },
      {
        label: "goals runtime directory",
        pattern: /\b(?:add|create|write|use|persist|store|read|maintain)\b.*\bgoals\//i,
      },
      {
        label: "checkpoint queue",
        pattern: /\b(?:add|create|write|use|persist|store|maintain|run|drain|process|enqueue|dequeue)\b.*\b(?:checkpoint\s+)?queue\b/i,
      },
      {
        label: "scheduler runtime",
        pattern: /\b(?:add|create|write|use|persist|store|maintain|run|start)\b.*\bscheduler\b/i,
      },
      {
        label: "mailbox runtime",
        pattern: /\b(?:add|create|write|use|persist|store|maintain|poll|drain|process)\b.*\bmailbox\b/i,
      },
      {
        label: "local runner",
        pattern: /\b(?:add|create|write|use|persist|store|maintain|run|start)\b.*\blocal runner\b/i,
      },
    ];

    const offenders: string[] = [];
    for (const file of trellisGoalSkill().files) {
      if (!relevantFiles.has(file.relativePath)) {
        continue;
      }

      file.content.split(/\r?\n/).forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || prohibitionLine.test(trimmed)) {
          return;
        }
        for (const { label, pattern } of secondLifecyclePatterns) {
          if (pattern.test(trimmed)) {
            offenders.push(
              `${label}: ${file.relativePath}:${index + 1}: ${trimmed}`,
            );
          }
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
