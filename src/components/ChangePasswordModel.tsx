import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CHANGE_PASSWORD } from "../graphql/mutations";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  const handleSubmit = async () => {
    try {
      await changePassword({ variables: { oldPassword, newPassword } });
      alert("Password changed successfully!");
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <input
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          placeholder="Old Password"
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full mb-3 p-2 border rounded"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-slate-900 text-white rounded">Change</button>
        </div>
      </div>
    </div>
  );
}
