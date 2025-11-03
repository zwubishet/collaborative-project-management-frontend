// src/components/TaskCard.tsx
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Calendar, User, Flag, X, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import {
  UPDATE_TASK,
  DELETE_TASK,
  ASSIGN_TASK_MEMBER,
  REMOVE_TASK_MEMBER,
} from "../graphql/mutations";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  assignees?: {
    id: string;
    user: { id: string; name: string; email: string };
  }[];
}

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface TaskCardProps {
  task: Task;
  members?: Member[];
}

export default function TaskCard({ task, members = [] }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  console.log("tasks: ", task);
  // Mutations
  const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, {
    onCompleted: () => {
      toast.success("Task updated!");
      setIsEditing(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const [deleteTask, { loading: deleting }] = useMutation(DELETE_TASK, {
    onCompleted: () => toast.success("Task deleted"),
    onError: (err) => toast.error(err.message),
    update(cache) {
      cache.evict({ id: cache.identify({ __typename: "Task", id: task.id }) });
      cache.gc();
    },
  });

  interface AssignTaskMemberData {
    assignTaskMember: {
      assignees: {
        id: string;
        user: { id: string; name: string; email: string };
      }[];
    };
  }

  interface RemoveTaskMemberData {
    removeTaskMember: {
      assignees: {
        id: string;
        user: { id: string; name: string; email: string };
      }[];
    };
  }


  const [assignMember] = useMutation<AssignTaskMemberData>(ASSIGN_TASK_MEMBER, {
    onCompleted: () => toast.success("Member assigned"),
    onError: (err) => toast.error(err.message),
    update(cache, { data }) {
      if (!data?.assignTaskMember) return;

      const newAssignee = data.assignTaskMember.assignees?.slice(-1)[0];
      if (!newAssignee) return;

      const taskRef = cache.identify({ __typename: "Task", id: task.id });
      cache.modify({
        id: taskRef,
        fields: {
          assignees(existing = [], { readField }) {
            const exists = existing.some((ref: any) =>
              readField("id", readField("user", ref)) === newAssignee.user.id
            );
            return exists ? existing : [...existing, newAssignee];
          },
        },
      });
    },
  });

  const [removeMember] = useMutation<RemoveTaskMemberData>(REMOVE_TASK_MEMBER, {
    onCompleted: () => toast.success("Member removed"),
    onError: (err) => toast.error(err.message),
    update(cache, { data }) {
      if (!data?.removeTaskMember) return;

      const updatedAssignees = data.removeTaskMember.assignees || [];
      const taskRef = cache.identify({ __typename: "Task", id: task.id });

      cache.modify({
        id: taskRef,
        fields: {
          assignees() {
            return updatedAssignees;
          },
        },
      });
    },
  });

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    await updateTask({
      variables: {
        taskId: parseInt(task.id),
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task permanently?")) return;
    await deleteTask({ variables: { taskId: parseInt(task.id) } });
  };

  const handleAssign = async (userId: string) => {
    await assignMember({
      variables: { taskId: parseInt(task.id), userId: parseInt(userId) },
    });
    setIsAddingMember(false);
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
      {/* Header: Title + Priority + Actions */}
      <div className="flex items-start justify-between mb-3">
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-semibold text-slate-900 flex-1 mr-2 border-b focus:outline-none focus:border-slate-500"
            autoFocus
          />
        ) : (
          <h4 className="text-base font-semibold text-slate-900 flex-1">{task.title}</h4>
        )}
        <div className="flex items-center gap-1">
          <Flag className={`w-4 h-4 ${priorityColor}`} />
          <Menu as="div" className="relative">
            <Menu.Button className="p-1 rounded hover:bg-slate-100">
              <Edit2 className="w-4 h-4 text-slate-500" />
            </Menu.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 mt-1 w-40 origin-top-right bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-slate-50" : ""}`}
                    >
                      Edit Task
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`w-full text-left px-3 py-2 text-sm text-red-600 ${active ? "bg-slate-50" : ""} disabled:opacity-50`}
                    >
                      {deleting ? "Deleting..." : "Delete Task"}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Description */}
      {isEditing ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description..."
          rows={2}
          className="w-full text-sm text-slate-600 mb-3 border rounded p-2 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      ) : task.description ? (
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      ) : null}

      {/* Status + Due Date */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs px-2 py-1 border rounded"
          >
            {["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {task.status.replace("_", " ")}
          </span>
        )}

        {isEditing ? (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          />
        ) : task.dueDate ? (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        ) : null}
      </div>

      {/* Priority (only in edit mode) */}
      {isEditing && (
        <div className="mb-3">
          <label className="text-xs text-slate-600">Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="ml-2 text-xs border rounded px-2 py-1"
          >
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Assignees */}
      {/* Assignees - Enhanced UI */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.assignees?.map((a) => (
            <div
              key={a.id}
              className="group flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-24 truncate">{a.user.name}</span>
              {task.status !== "COMPLETED" && (
                <button
                  onClick={() => handleRemove(a.user.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  title="Remove assignee"
                >
                  <X className="w-3.5 h-3.5 text-red-500 hover:text-red-700" />
                </button>
              )}
            </div>
          ))}
            {task.assignees?.length === 0 && task.status !== "COMPLETED" && (
              <p className="text-xs text-slate-400 italic">No assignees yet</p>
            )}
        </div>

        {/* Assign Member - Improved Dropdown Trigger */}
        {task.status !== "COMPLETED" && (
          <div className="relative">
            {isAddingMember ? (
             <select
                value={isAddingMember ? "" : undefined}
                onChange={(e) => {
                  if (e.target.value) handleAssign(e.target.value);
                }}
                onBlur={() => setIsAddingMember(false)}
                className="text-xs border border-slate-300 rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white shadow-sm appearance-none cursor-pointer"
                autoFocus
              >
                <option value="" disabled>
                  Select a member...
                </option>
                {members
                  .filter((m) => !task.assignees?.some((a) => a.user.id === m.user.id))
                  .map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name} ({m.role})
                    </option>
                  ))}
              </select>
            ) : (
              <button
                onClick={() => setIsAddingMember(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </div>
                <span>Add assignee</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save/Cancel (Edit Mode) */}
      {isEditing && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={updating || !title.trim()}
            className="flex-1 py-1.5 bg-slate-900 text-white text-xs rounded disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setTitle(task.title);
              setDescription(task.description || "");
              setStatus(task.status);
              setPriority(task.priority);
              setDueDate(task.dueDate || "");
            }}
            className="flex-1 py-1.5 border border-slate-300 text-slate-700 text-xs rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}