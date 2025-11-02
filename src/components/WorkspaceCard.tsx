import { useNavigate } from "react-router-dom";
import { FolderOpen, Users, Calendar } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

interface WorkspaceCardProps {
  workspace: Workspace;
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/workspace/${workspace.id}`)}
      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-slate-100 p-3 rounded-lg">
          <FolderOpen className="w-6 h-6 text-slate-700" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-2">{workspace.name}</h3>

      {workspace.description && (
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{workspace.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{workspace.members?.length??0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <FolderOpen className="w-4 h-4" />
          <span>{workspace.projects?.length??0} projects</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <Calendar className="w-4 h-4" />
        <span>
            Created{" "}
            {new Date(Number(workspace.createdAt)).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
        </span>
      </div>
    </div>
  );
}
