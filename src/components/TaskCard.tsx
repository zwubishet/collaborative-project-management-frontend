import { Calendar, User, Flag } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
  };
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const statusColors = {
    TODO: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
  };

  const priorityColors = {
    LOW: "text-slate-500",
    MEDIUM: "text-yellow-500",
    HIGH: "text-orange-500",
    URGENT: "text-red-500",
  };

  const statusColor = statusColors[task.status as keyof typeof statusColors] || statusColors.TODO;
  const priorityColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-base font-semibold text-slate-900 flex-1">{task.title}</h4>
        <Flag className={`w-4 h-4 ${priorityColor}`} />
      </div>

      {task.description && (
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {task.status.replace("_", " ")}
        </span>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.assignee.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
