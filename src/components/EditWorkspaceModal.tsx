import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Loader2, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  workspace: { id: number; name: string; description?: string | null };
  // allow null because GraphQL can return null
  onSave: (name: string, description?: string | null) => Promise<void>;
  saving: boolean;
};

export default function EditWorkspaceModal({
  isOpen,
  onClose,
  workspace,
  onSave,
  saving,
}: Props) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // send exactly what the backend expects
    await onSave(name.trim(), description.trim() || null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Edit Workspace
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 flex items-center gap-2 text-sm font-medium"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}