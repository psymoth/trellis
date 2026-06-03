"""
Task data access layer.

Single source of truth for loading and iterating task directories.
Replaces scattered task.json parsing across 9+ files.

Provides:
    load_task          — Load a single task by directory path
    iter_active_tasks  — Iterate all non-archived tasks (sorted)
    get_all_statuses   — Get {dir_name: status} map for children progress
"""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

from .io import read_json
from .paths import DIR_ARCHIVE, FILE_TASK_JSON
from .types import TaskInfo

_DONE_STATUSES = ("completed", "done")
_MISSING_CHILD_STATUS = "missing"


@dataclass(frozen=True)
class ChildTaskSummary:
    """Display-ready view of a parent task's child entry."""

    dir_name: str
    status: str
    assignee: str
    parent: str | None
    is_goal: bool
    is_active: bool
    is_archived: bool


@dataclass(frozen=True)
class TaskHierarchySummary:
    """Parent/child summary plus drift warnings for a task."""

    parent: str | None
    children: tuple[ChildTaskSummary, ...]
    done_count: int
    total_count: int
    warnings: tuple[str, ...]


def load_task(task_dir: Path) -> TaskInfo | None:
    """Load task from a directory containing task.json.

    Args:
        task_dir: Absolute path to the task directory.

    Returns:
        TaskInfo if task.json exists and is valid, None otherwise.
    """
    task_json = task_dir / FILE_TASK_JSON
    if not task_json.is_file():
        return None

    data = read_json(task_json)
    if not data:
        return None

    return TaskInfo(
        dir_name=task_dir.name,
        directory=task_dir,
        title=data.get("title") or data.get("name") or "unknown",
        status=data.get("status", "unknown"),
        assignee=data.get("assignee", ""),
        priority=data.get("priority", "P2"),
        children=tuple(data.get("children", [])),
        parent=data.get("parent"),
        package=data.get("package"),
        raw=data,
    )


def iter_active_tasks(tasks_dir: Path) -> Iterator[TaskInfo]:
    """Iterate all active (non-archived) tasks, sorted by directory name.

    Skips the "archive" directory and directories without valid task.json.

    Args:
        tasks_dir: Path to the tasks directory.

    Yields:
        TaskInfo for each valid task.
    """
    if not tasks_dir.is_dir():
        return

    for d in sorted(tasks_dir.iterdir()):
        if not d.is_dir() or d.name == "archive":
            continue
        info = load_task(d)
        if info is not None:
            yield info


def get_all_statuses(tasks_dir: Path) -> dict[str, str]:
    """Get a {dir_name: status} mapping for all active tasks.

    Useful for computing children progress without loading full TaskInfo.

    Args:
        tasks_dir: Path to the tasks directory.

    Returns:
        Dict mapping directory names to status strings.
    """
    return {t.dir_name: t.status for t in iter_active_tasks(tasks_dir)}


def is_trellis_goal(task: TaskInfo) -> bool:
    """Return whether a loaded task is marked as a Trellis goal."""
    meta = task.meta
    if not isinstance(meta, dict):
        return False
    goal = meta.get("trellis_goal")
    return isinstance(goal, dict) and goal.get("enabled") is True


def find_archived_task_by_dir_name(tasks_dir: Path, dir_name: str) -> Path | None:
    """Find an archived task directory by exact task directory name."""
    archive_root = tasks_dir / DIR_ARCHIVE
    if not archive_root.is_dir():
        return None

    for month_dir in sorted(archive_root.iterdir()):
        if not month_dir.is_dir():
            continue
        candidate = month_dir / dir_name
        if candidate.is_dir():
            return candidate

    return None


def _child_is_done(child: ChildTaskSummary) -> bool:
    return child.is_archived or child.status in _DONE_STATUSES


def describe_task_hierarchy(
    task: TaskInfo,
    all_tasks: dict[str, TaskInfo],
    tasks_dir: Path,
) -> TaskHierarchySummary:
    """Describe a task's parent/child links and obvious hierarchy drift.

    Active child tasks are resolved from ``all_tasks``. Missing active children
    are checked under ``tasks/archive`` before being treated as missing.
    """
    warnings: list[str] = []
    children: list[ChildTaskSummary] = []

    for child_name in task.children:
        child = all_tasks.get(child_name)
        is_active = child is not None
        is_archived = False

        if child is None:
            archived_dir = find_archived_task_by_dir_name(tasks_dir, child_name)
            if archived_dir is not None:
                child = load_task(archived_dir)
                is_archived = child is not None

        if child is None:
            children.append(
                ChildTaskSummary(
                    dir_name=child_name,
                    status=_MISSING_CHILD_STATUS,
                    assignee="",
                    parent=None,
                    is_goal=False,
                    is_active=False,
                    is_archived=False,
                )
            )
            warnings.append(
                f"Child listed but not found in active tasks or archive: {child_name}"
            )
            continue

        if child.parent != task.dir_name:
            warnings.append(
                "Child parent mismatch: "
                f"{child.dir_name} parent is {child.parent or '-'}, "
                f"expected {task.dir_name}"
            )

        children.append(
            ChildTaskSummary(
                dir_name=child.dir_name,
                status=child.status,
                assignee=child.assignee,
                parent=child.parent,
                is_goal=is_trellis_goal(child),
                is_active=is_active,
                is_archived=is_archived,
            )
        )

    child_names = set(task.children)
    for other in all_tasks.values():
        if other.parent == task.dir_name and other.dir_name not in child_names:
            warnings.append(
                "Task points to this parent but is missing from children list: "
                f"{other.dir_name}"
            )

    if task.parent:
        parent_task = all_tasks.get(task.parent)
        if parent_task is None:
            archived_parent_dir = find_archived_task_by_dir_name(tasks_dir, task.parent)
            parent_task = load_task(archived_parent_dir) if archived_parent_dir else None
        if parent_task is None:
            warnings.append(f"Parent not found in active tasks or archive: {task.parent}")
        elif task.dir_name not in parent_task.children:
            warnings.append(
                f"Parent children list does not include this task: {task.parent}"
            )

    done_count = sum(1 for child in children if _child_is_done(child))
    return TaskHierarchySummary(
        parent=task.parent,
        children=tuple(children),
        done_count=done_count,
        total_count=len(children),
        warnings=tuple(warnings),
    )


def children_progress(
    children: tuple[str, ...] | list[str],
    all_statuses: dict[str, str],
) -> str:
    """Format children progress string like " [2/3 done]".

    Args:
        children: List of child directory names.
        all_statuses: Status map from get_all_statuses().

    Returns:
        Formatted string, or "" if no children.
    """
    if not children:
        return ""
    # A child missing from active statuses has been archived (cmd_archive
    # sets status=completed before moving the dir). Count it as done so
    # parent progress doesn't regress when children are archived.
    done = sum(
        1 for c in children
        if c not in all_statuses or all_statuses.get(c) in _DONE_STATUSES
    )
    return f" [{done}/{len(children)} done]"
