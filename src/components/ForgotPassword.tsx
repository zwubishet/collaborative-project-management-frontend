import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEND_RESET_PASSWORD_MUTATION } from "../graphql/mutations";
import { useMutation } from "@apollo/client/react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sendReset] = useMutation(SEND_RESET_PASSWORD_MUTATION);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendReset({ variables: { email } });
      setMessage("Password reset link sent! Check your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Forgot Password</h1>
        <p className="text-slate-600 mb-6">Enter your email to reset your password</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {message && <div className="text-green-700 text-sm">{message}</div>}
          {error && <div className="text-red-700 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-slate-600 mt-4">
          Remembered your password?{" "}
          <span
            className="text-slate-900 font-medium hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
