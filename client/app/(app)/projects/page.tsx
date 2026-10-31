"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge, Button, Card, CardGridSkeleton, ConfirmDialog, EmptyState, ErrorState, Modal, PageHeader, Select,
} from "@/components/ui";
import ProjectForm from "@/components/ProjectForm";
import { useToast } from "@/components/ToastProvider";
import { useResource } from "@/components/useResource";
import { errorMessage } from "@/lib/api";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE } from "@/lib/format";
import { createProject, deleteProject, listProjects, updateProject } from "@/lib/projects";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const { data: projects, loading, error, reload, mutate } = useResource(listProjects);
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [filter, setFilter] = useState("all");

  const visible = (projects ?? []).filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" subtitle="Organize your work into projects, sprints and tasks.">
        <Button onClick={() => setCreating(true)}><Plus size={16} className="mr-1" /> New project</Button>
      </PageHeader>

      <div className="max-w-xs">
        <Select id="project-filter" label="Status" value={filter} onChange={(e) => setFilter(e.target.value)}
          options={{ all: "All projects", ...PROJECT_STATUS_LABEL }} />
      </div>

      {loading && !projects && <CardGridSkeleton />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {projects &&
        (visible.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <li key={p._id}>
                <Card className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/projects/${p._id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-700 hover:underline">
                      {p.name}
                    </Link>
                    <Badge tone={PROJECT_STATUS_TONE[p.status]}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{p.description || "No description."}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                      <Pencil size={14} className="mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}>
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title={projects.length ? "No projects match this filter" : "No projects yet"}
            text={projects.length ? "Try a different status." : "Create your first project to start planning."}
          >
            {!projects.length && (
              <Button onClick={() => setCreating(true)}><FolderKanban size={16} className="mr-1" /> Create project</Button>
            )}
          </EmptyState>
        ))}

      {creating && (
        <Modal title="New project" onClose={() => setCreating(false)}>
          <ProjectForm submitLabel="Create project" onCancel={() => setCreating(false)}
            onSubmit={async (values) => {
              await createProject(values);
              setCreating(false);
              toast("Project created");
              reload();
            }} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit project" onClose={() => setEditing(null)}>
          <ProjectForm initial={editing} submitLabel="Save changes" onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              const updated = await updateProject(editing._id, values);
              mutate((all) => all.map((p) => (p._id === updated._id ? updated : p)));
              setEditing(null);
              toast("Project updated");
            }} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete project?"
          message={`"${deleting.name}" and all of its sprints and tasks will be permanently deleted.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await deleteProject(deleting._id);
              mutate((all) => all.filter((p) => p._id !== deleting._id));
              toast("Project deleted");
            } catch (err) {
              toast(errorMessage(err, "Could not delete the project."), "error");
            }
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
