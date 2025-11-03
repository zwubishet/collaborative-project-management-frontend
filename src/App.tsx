import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkspacePage from "./pages/WorkspacePage";
import ProjectPage from "./pages/ProjectPage";
import ForgotPassword from "./components/ForgotPassword";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toaster inside AuthProvider so auth toasts work */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
              fontSize: "14px",
              borderRadius: "8px",
              padding: "12px 16px",
            },
            success: {
              icon: "Success",
              style: { background: "#10b981" },
            },
            error: {
              icon: "Error",
              style: { background: "#ef4444" },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:id"
            element={
              <ProtectedRoute>
                <WorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;