"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar } from "lucide-react";
import type { Project, Sprint, Task, TaskStatus } from "@/types";
import {
  formatDate,
  isOverdue,
  PRIORITY_LABEL,
  PRIORITY_TONE,
  STATUS_LABEL,
  TASK_STATUS_TONE,
} from "@/lib/format";
import { Badge } from "./ui";

export interface TaskActions {
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onSprintChange: (task: Task, sprintId: string | null) => void;
}

interface CommonProps extends TaskActions {
  tasks: Task[];
  sprints: Sprint[];
  projects?: Project[]; // when given, the project name is shown on each task
}

export function TaskBadges({ task }: { task: Task }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={TASK_STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
      <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
      {isOverdue(task) && <Badge tone="red">Overdue</Badge>}
    </div>
  );
}

function DueDate({ task }: { task: Task }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <Calendar size={14} aria-hidden /> {formatDate(task.dueDate)}
    </span>
  );
}

const miniSelect =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus-visible:outline-2 focus-visible:outline-indigo-600";

function TaskControls({
  task,
  sprints,
  onStatusChange,
  onSprintChange,
}: { task: Task; sprints: Sprint[] } & TaskActions) {
  const projectSprints = sprints.filter((s) => s.project === task.project);
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <select
        aria-label={`Status of ${task.title}`}
        value={task.status}
        onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
        className={miniSelect}
      >
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <select
        aria-label={`Sprint of ${task.title}`}
        value={task.sprint ?? ""}
        onChange={(e) => onSprintChange(task, e.target.value || null)}
        className={miniSelect}
      >
        <option value="">Backlog</option>
        {projectSprints.map((s) => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}

const cardClass = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
const linkClass =
  "font-medium text-slate-900 hover:text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600";

function ProjectName({ task, projects }: { task: Task; projects?: Project[] }) {
  const name = projects?.find((p) => p._id === task.project)?.name;
  return name ? <p className="text-xs text-slate-500">{name}</p> : null;
}

export default function TaskList({ tasks, sprints, projects, ...actions }: CommonProps) {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task._id} className={cardClass}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={`/tasks/${task._id}`} className={linkClass}>{task.title}</Link>
              <ProjectName task={task} projects={projects} />
            </div>
            <DueDate task={task} />
          </div>
          <div className="mt-2"><TaskBadges task={task} /></div>
          <TaskControls task={task} sprints={sprints} {...actions} />
        </li>
      ))}
    </ul>
  );
}

const COLUMNS: TaskStatus[] = ["todo", "in-progress", "done"];

export function TaskBoard({ tasks, sprints, projects, ...actions }: CommonProps) {
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        return (
          <section
            key={status}
            aria-label={STATUS_LABEL[status]}
            onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const task = tasks.find((t) => t._id === e.dataTransfer.getData("text/plain"));
              if (task && task.status !== status) actions.onStatusChange(task, status);
            }}
            className={`rounded-2xl p-3 ${dragOver === status ? "bg-indigo-100" : "bg-slate-100"}`}
          >
            <h3 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-slate-700">
              {STATUS_LABEL[status]}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">{items.length}</span>
            </h3>
            <ul className="space-y-2">
              {items.map((task) => (
                <li
                  key={task._id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", task._id)}
                  className={`${cardClass} cursor-grab active:cursor-grabbing`}
                >
                  <Link href={`/tasks/${task._id}`} className={`${linkClass} text-sm`}>{task.title}</Link>
                  <ProjectName task={task} projects={projects} />
                  <div className="mt-2 flex items-center justify-between">
                    <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
                    <DueDate task={task} />
                  </div>
                  <TaskControls task={task} sprints={sprints} {...actions} />
                </li>
              ))}
              {items.length === 0 && <li className="px-1 py-4 text-center text-xs text-slate-500">No tasks</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
