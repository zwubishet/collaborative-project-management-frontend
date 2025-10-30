import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Calendar, User, Flag, X, Plus } from "lucide-react";
import { ASSIGN_TASK_MEMBER, REMOVE_TASK_MEMBER } from "../graphql/mutations";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignees?: { id: string; name: string }[];
}

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskCardProps {
  task: Task;
  members?: Member[];
}

export default function TaskCard({ task, members = [] }: TaskCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const [assignMember] = useMutation(ASSIGN_TASK_MEMBER);
  const [removeMember] = useMutation(REMOVE_TASK_MEMBER);

  const handleAssign = async (userId: string) => {
    console.log("Assigning user:", userId, "to task:", task.id);
    await assignMember({
      variables: { id: parseInt(task.id), userId: parseInt(userId) },
    });
    setIsAdding(false);
    
  };

  const handleRemove = async (userId: string) => {
    await removeMember({
      variables: { taskId: parseInt(task.id), userId: parseInt(userId) },
    });
  };

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
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-base font-semibold text-slate-900 flex-1">{task.title}</h4>
        <Flag className={`w-4 h-4 ${priorityColor}`} />
      </div>

      {task.description && (
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {task.status.replace("_", " ")}
        </span>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Members section */}
      <div className="mt-2">
        <div className="flex flex-wrap gap-2">
          {task.assignees?.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full text-xs"
            >
              <User className="w-3 h-3" />
              <span>{m.name}</span>
              {task.status !== "COMPLETED" && (
                <button onClick={() => handleRemove(m.id)}>
                  <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add member dropdown (only if not completed) */}
        {task.status !== "COMPLETED" && (
          <div className="mt-2">
            {isAdding ? (
              <select
                onChange={(e) => handleAssign(e.target.value)}
                className="text-sm border border-slate-300 rounded px-2 py-1"
              >
                <option value="">Select member</option>
                {members
                  .filter((m) => !task.assignees?.some((a) => a.id === m.id))
                  .map((m) => (
                    <option key={`${m.user.id}-${m.role}`} value={m.user.id}>
  {m.user.name} ({m.user.email})
</option>

                  ))}
              </select>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
              >
                <Plus className="w-3 h-3" /> Assign member
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
