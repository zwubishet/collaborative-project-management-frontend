import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  tasks?: { id: string; status: string }[];
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

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

  const taskStats = project.tasks
    ? {
        total: project.tasks.length,
        completed: project.tasks.filter((t) => t.status === "COMPLETED").length,
      }
    : { total: 0, completed: 0 };

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-slate-100 p-3 rounded-lg">
          <FileText className="w-6 h-6 text-slate-700" />
        </div>
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          <StatusIcon className="w-3 h-3" />
          {project.status}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.name}</h3>

      {project.description && (
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      )}

      {project.tasks && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-900 font-medium">
              {taskStats.completed}/{taskStats.total} tasks
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-slate-900 h-2 rounded-full transition-all"
              style={{
                width: taskStats.total > 0 ? `${(taskStats.completed / taskStats.total) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
