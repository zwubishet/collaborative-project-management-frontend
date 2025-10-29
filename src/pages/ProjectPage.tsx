import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { GET_PROJECT } from "../graphql/queries";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error } = useQuery(GET_PROJECT, {
    variables: { id },
    skip: !id,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-red-600">Error loading project</p>
          </div>
        </div>
      </div>
    );
  }

  const project = data.project;
  const workspace = project.workspace;

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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/workspace/${workspace.id}`)}
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
              </div>
              {project.description && (
                <p className="text-slate-600 mb-4">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>
                  <span className="font-medium">Workspace:</span> {workspace.name}
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
              {tasksByStatus.TODO.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">In Progress</h3>
                <span className="bg-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                  {tasksByStatus.IN_PROGRESS.length}
                </span>
              </div>
              {tasksByStatus.IN_PROGRESS.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">In Review</h3>
                <span className="bg-yellow-200 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
                  {tasksByStatus.IN_REVIEW.length}
                </span>
              </div>
              {tasksByStatus.IN_REVIEW.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Completed</h3>
                <span className="bg-green-200 text-green-700 text-xs font-medium px-2 py-1 rounded">
                  {tasksByStatus.COMPLETED.length}
                </span>
              </div>
              {tasksByStatus.COMPLETED.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </main>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={id!}
        members={workspace.members || []}
      />
    </div>
  );
}
