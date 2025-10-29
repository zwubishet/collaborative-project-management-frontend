import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { GET_WORKSPACE } from "../graphql/queries";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { useQuery } from "@apollo/client/react";

// Type for GET_WORKSPACE
type WorkspaceQuery = {
  workspace: {
    id: number;
    name: string;
    description?: string | null;
    owner: { id: number; name: string };
    members: { id: number; role: string; user: { id: number; name: string; email: string } }[];
    projects: { id: number; name: string; }[];
  };
};

export default function WorkspacePage() {
  const { id: idStr } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const id = idStr ? parseInt(idStr, 10) : null;

  if (!id || isNaN(id)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">Invalid workspace ID</p>
      </div>
    );
  }

  const { data, loading, error } = useQuery<WorkspaceQuery>(GET_WORKSPACE, {
    variables: { id },
  });

  console.log("WorkspacePage data:", data, "loading:", loading, "error:", error);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.workspace) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-red-600">Error loading workspace: {error?.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const workspace = data.workspace;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-slate-600 mb-4">{workspace.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{workspace.members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Owner:</span>
                  <span>{workspace.owner.name}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-slate-600 mt-1">Manage projects within this workspace</p>
        </div>

        {workspace.projects?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspace.projects?.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={id.toString()} // ← Pass as string to modal
      />
    </div>
  );
}