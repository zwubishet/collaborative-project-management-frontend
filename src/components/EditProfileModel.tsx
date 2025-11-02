import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_PROFILE } from "../graphql/mutations";

export default function ProfileModal({ user, onClose }: { user: { id: string; name: string; email: string }, onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const handleSubmit = async () => {
    await updateProfile({ variables: { name, email } });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-slate-900 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
