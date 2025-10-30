import { useState } from "react";
import {useMutation } from "@apollo/client/react";
import { DocumentNode } from "graphql";
import { X } from "lucide-react";
import { Add_TASK } from "../graphql/mutations";
import { GET_PROJECT } from "../graphql/queries";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  members?: Array<{ id: string; name: string }>;
}

export default function CreateTaskModal({ isOpen, onClose, projectId, members = [] }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");

  const [createTask, { loading }] = useMutation(Add_TASK, {
    update(cache: { readQuery: (arg0: { query: DocumentNode; variables: { id: number; }; }) => any; writeQuery: (arg0: { query: DocumentNode; variables: { id: number; }; data: { getProject: any; }; }) => void; }, { data }: any) {
      if (!data?.addTask) return;
      const newTask = data.addTask;
      
      const existing = cache.readQuery({
        query: GET_PROJECT,
        variables: { id: projectId },
      });

      if (existing?.getProject) {
        cache.writeQuery({
          query: GET_PROJECT,
          variables: { id: projectId },
          data: {
            getProject: {
              ...existing.getProject,
              tasks: [...existing.getProject.tasks, newTask],
            },
          },
        });
      }
    },
    // optional fallback refetch if cache not ready
    refetchQueries: [{ query: GET_PROJECT, variables: { id: projectId } }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createTask({
        variables: {
          input: {
            projectId,
            title,
            description: description || null,
            status,
            priority,
            dueDate: dueDate || null,
            assigneeId: assigneeId || null,
          },
        },
      });

      // reset form and close modal
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setDueDate("");
      setAssigneeId("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-slate-900">Create Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add more details..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Due Date (Optional)</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assign To (Optional)</label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
