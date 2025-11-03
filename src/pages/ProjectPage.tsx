// src/pages/ProjectPage.tsx
import { useState, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSuspenseQuery, skipToken, useMutation } from "@apollo/client/react";
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { GET_PROJECT, GET_WORKSPACE } from "../graphql/queries";
import { UPDATE_PROJECT, DELETE_PROJECT } from "../graphql/mutations";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import EditProjectModal from "../components/EditProjectModal";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

type GetProjectQueryVariables = {
  projectId: number;
};

type GetProjectQuery = {
  project: {
    description: null;
    id: string;
    name: string;
    status: "ACTIVE" | "PENDING" | "COMPLETED" | "ARCHIVED" | string;
    createdAt: string;
    updatedAt: string;
    workspace: {
      id: string;
      name: string;
      members?: {
        id: string;
        name: string;
        email: string;
        role: string;
      }[];
    };
    tasks: {
      id: string;
      title: string;
      description?: string | null;
      status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | string;
      createdAt: string;
      updatedAt: string;
      priority: "LOW" | "MEDIUM" | "HIGH" | string;
      assignees: {
        id: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
      }[];
    }[];
  };
};

type WorkspaceQuery = {
  workspace: {
    id: number;
    name: string;
    description?: string | null;
    owner: { id: number; name: string };
    members: { id: number; role: string; user: { id: number; name: string; email: string } }[];
    projects: { id: number; name: string }[];
  };
};

function ProjectContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const auth = useAuth();
  const currentUserId = auth?.user?.id ? Number(auth.user.id) : null;

  const { data } = useSuspenseQuery<GetProjectQuery, GetProjectQueryVariables>(
    GET_PROJECT,
    id ? { variables: { projectId: parseInt(id, 10) } } : skipToken
  );

  const workspaceId = data?.project?.workspace?.id;
  console.log("Workspace ID:", workspaceId);

  const { data: workspaceData } = useSuspenseQuery<WorkspaceQuery>(
    GET_WORKSPACE,
    workspaceId ? { variables: { id: workspaceId } } : skipToken
  );

  // ---- EDIT & DELETE MUTATIONS (only added) ----
const [updateProject, { loading: updating }] = useMutation(UPDATE_PROJECT, {
  onCompleted: () => {
    toast.success("Project updated successfully!");
    setIsEditModalOpen(false);
  },
  onError: (err) => {
    toast.error(err.message || "Failed to update project");
  },
  refetchQueries: [{ query: GET_PROJECT, variables: { projectId: parseInt(id!, 10) } }],
});

const [deleteProject, { loading: deleting }] = useMutation(DELETE_PROJECT, {
  onCompleted: () => {
    toast.success("Project deleted successfully");
    navigate(`/workspace/${workspaceId}`);
  },
  onError: (err) => {
    toast.error(err.message || "Failed to delete project");
  },
});

  const handleUpdate = async (name: string, description: string | null, status: string) => {
    await updateProject({
      variables: {
        id: parseInt(project.id, 10),
        name: name.trim(),
        description: description?.trim() || null,
        status,
      },
    });
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project? All tasks will be permanently removed.")) return;
    try {
      await deleteProject({ variables: { id: parseInt(project.id, 10) } });
    } catch (err: any) {
      alert(err.message);
    }
  };
  // ---------------------------------------------

  if (!data) {
    throw new Error("Project data is undefined");
  }

  const project = data.project;
  const workspace = workspaceData?.workspace;
  const taskCardMembers = workspace?.members?.map((m) => ({
    id: m.user.id.toString(),
    role: m.role,
    user: {
      ...m.user,
      id: m.user.id.toString(),
    },
  })) || [];
  const taskCardMembersForModal = workspace?.members?.map((m) => ({
    id: m.user.id.toString(),
    name: m.user.name,
  })) || [];

  const tasksByStatus = {
    TODO: project.tasks.filter((t: any) => t.status === "TODO"),
    IN_PROGRESS: project.tasks.filter((t: any) => t.status === "IN_PROGRESS"),
    IN_REVIEW: project.tasks.filter((t: any) => t.status === "IN_REVIEW"),
    COMPLETED: project.tasks.filter((t: any) => t.status === "COMPLETED"),
  };

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-slate-100 text-slate-700",
  };

  const statusIcons = {
    ACTIVE: CheckCircle2,
    PENDING: Clock,
    COMPLETED: CheckCircle2,
    ARCHIVED: AlertCircle,
  };

  const StatusIcon = statusIcons[project.status as keyof typeof statusIcons] || Clock;
  const statusColor = statusColors[project.status as keyof typeof statusColors] || statusColors.PENDING;

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/workspace/${workspace?.id}`)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Workspace</span>
        </button>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                  <StatusIcon className="w-3 h-3" />
                  {project.status}
                </span>

                {/* ---- OWNER-ONLY EDIT/DELETE BUTTONS ---- */}
                {workspace?.owner.id === currentUserId && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-slate-600 hover:text-slate-900"
                      title="Edit project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      title="Delete project"
                    >
                      {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                )}
                {/* --------------------------------------- */}
              </div>

              {project.description != null && (
                <p className="text-slate-600 mb-4">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>
                  <span className="font-medium">Workspace:</span> {workspace?.name}
                </span>
                <span>
                  <span className="font-medium">Total Tasks:</span> {project.tasks.length}
                </span>
                <span>
                  <span className="font-medium">Completed:</span>{" "}
                  {project.tasks.filter((t: any) => t.status === "COMPLETED").length}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {project.tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks yet</h3>
            <p className="text-slate-600 mb-6">Create your first task to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">To Do</h3>
                <span className="bg-slate-200 text-slate-700 text-xs font-medium px-2 py-1 rounded">
                  {tasksByStatus.TODO.length}
                </span>
              </div>
              {tasksByStatus.TODO.map((task: any, index: number) => (
                <TaskCard key={`${task.id}-${index}`} task={task} members={taskCardMembers} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">In Progress</h3>
                <span className="bg-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                  {tasksByStatus.IN_PROGRESS.length}
                </span>
              </div>
              {tasksByStatus.IN_PROGRESS.map((task: any, index: number) => (
                <TaskCard key={`${task.id}-${index}`} task={task} members={taskCardMembers} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">In Review</h3>
                <span className="bg-yellow-200 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
                  {tasksByStatus.IN_REVIEW.length}
                </span>
              </div>
              {tasksByStatus.IN_REVIEW.map((task: any, index: number) => (
                <TaskCard key={`${task.id}-${index}`} task={task} members={taskCardMembers} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Completed</h3>
                <span className="bg-green-200 text-green-700 text-xs font-medium px-2 py-1 rounded">
                  {tasksByStatus.COMPLETED.length}
                </span>
              </div>
              {tasksByStatus.COMPLETED.map((task: any, index: number) => (
                <TaskCard key={`${task.id}-${index}`} task={task} members={taskCardMembers} />
              ))}
            </div>
          </div>
        )}
      </main>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={parseInt(project.id, 10)}
        members={taskCardMembersForModal}
      />

      {/* ---- EDIT MODAL (inside ProjectContent so `project` is in scope) ---- */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
        }}
        onSave={handleUpdate}
        saving={updating}
      />
    </>
  );
}

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading project...</p>
            </div>
          </div>
        }
      >
        <ProjectContent />
      </Suspense>
    </div>
  );
}