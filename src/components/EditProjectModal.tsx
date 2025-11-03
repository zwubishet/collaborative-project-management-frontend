// src/components/EditProjectModal.tsx
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: { id: string; name: string; description: string | null; status: string };
  onSave: (name: string, description: string | null, status: string) => Promise<void>;
  saving?: boolean;
}

const statusOptions = ["ACTIVE", "PENDING", "COMPLETED", "ARCHIVED"] as const;

export default function EditProjectModal({ isOpen, onClose, project, onSave, saving }: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState(project.status);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(name, description || null, status);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}