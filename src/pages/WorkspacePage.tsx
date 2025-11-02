import { useParams, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ArrowLeft, Plus, Users, UserPlus, Trash2, Loader2 } from "lucide-react";
import { GET_WORKSPACE, GET_WORKSPACE_PROJECTS } from "../graphql/queries";
import { ADD_WORKSPACE_MEMBER, REMOVE_WORKSPACE_MEMBER } from "../graphql/mutations";
import { GET_ALL_USERS } from "../graphql/queries";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { useQuery, useMutation } from "@apollo/client/react";
import { AuthContext } from "../contexts/AuthContext";
import EditWorkspaceModal from "../components/EditWorkspaceModal";
import { UPDATE_WORKSPACE, DELETE_WORKSPACE } from "../graphql/mutations";

type WorkspaceQuery = {
  workspace: {
    id: number;
    name: string;
    description?: string | null;
    owner: { id: number; name: string };
    members: { id: number; role: string; user: { id: number; name: string; email: string } }[];
    projects: { id: number; name: string; status: string }[];
  };
};

type WorkspaceProjectsQuery = {
  workspaceProjects: {
    id: number;
    name: string;
    members: { id: number; role: string; user: { id: number; name: string; email: string } }[];
    projects: { id: number; title: string; status: string }[];
  }[];
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function WorkspacePage() {
  const { id: idStr } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newMemberRole, setNewMemberRole] = useState<"MEMBER" | "VIEWER">("MEMBER");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { user: loggedInUser } = useContext(AuthContext)!;
  const contextUserId = loggedInUser?.id ? Number(loggedInUser.id) : undefined;

  const id = idStr ? Number(idStr) : null;   // <-- number!
  if (!id || isNaN(id)) return <p className="text-red-600">Invalid workspace ID</p>;

  // Fetch workspace data
  const { data: workspaceData, loading: workspaceLoading, error: workspaceError } = useQuery<WorkspaceQuery>(GET_WORKSPACE, { variables: { id } });

  // Fetch workspace projects
  const { data: projectsData, loading: projectsLoading } = useQuery<WorkspaceProjectsQuery>(GET_WORKSPACE_PROJECTS, { variables: { workspaceId: id } });
  const projects = projectsData?.workspaceProjects || [];

  // Fetch all users for adding to workspace
  const { data: allUsersData, loading: allUsersLoading } = useQuery<{ users: User[] }>(GET_ALL_USERS);
  const allUsers = allUsersData?.users || [];

  // Mutations
  const [addMemberMutation, { loading: addingMember }] = useMutation(ADD_WORKSPACE_MEMBER, {
    refetchQueries: [{ query: GET_WORKSPACE, variables: { id } }],
  });
  const [removeMemberMutation, { loading: removingMember }] = useMutation(REMOVE_WORKSPACE_MEMBER, {
    refetchQueries: [{ query: GET_WORKSPACE, variables: { id } }],
  });
  const [updateWorkspace, { loading: updating }] = useMutation(UPDATE_WORKSPACE, {
  refetchQueries: [{ query: GET_WORKSPACE, variables: { id } }],
});

const [deleteWorkspace, { loading: deleting }] = useMutation(DELETE_WORKSPACE);

  // Add member
  const handleAddMember = async () => {
    if (!selectedUserId) return alert("Select a user");
    try {
      await addMemberMutation({
        variables: {
          workspaceId: id,
          userId: selectedUserId,
          role: newMemberRole,
        },
      });
      setSelectedUserId(null);
      setNewMemberRole("MEMBER");
    } catch (err: any) {
      alert(err.message);
      console.error(err as Error);
    }
  };

  // Remove member
  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMemberMutation({ variables: { workspaceId: id, userId } });
    } catch (err: any) {
      alert(err.message);
      console.error(err as Error);
    }
  };

  const handleUpdate = async (name: string, description?: string | null) => {
  await updateWorkspace({
    variables: { id, name, description: description || null },
  });
};

const handleDelete = async () => {
  if (!confirm("Delete this workspace? All projects and data will be lost.")) return;
  try {
    await deleteWorkspace({ variables: { id } });
    navigate("/dashboard");
  } catch (e: any) {
    alert(e.message);
  }
};

  if (workspaceLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (workspaceError || !workspaceData?.workspace) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading workspace</p>
          <p className="text-slate-500 text-sm mt-1">{workspaceError?.message}</p>
        </div>
      </div>
    );
  }

  const workspace = workspaceData.workspace;
  console.log("Workspace project:", workspace.projects);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Workspace Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{workspace.name}</h1>

                {/* Only the owner can edit/delete */}
                {workspace.owner.id === contextUserId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-slate-600 hover:text-slate-900"
                      title="Edit workspace"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      title="Delete workspace"
                    >
                      {deleting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              {workspace.description ? (
                <p className="text-slate-600 mt-2 max-w-3xl">{workspace.description}</p>
              ) : (
                <p className="text-slate-400 italic mt-2">No description</p>
              )}

              {/* === Header – Owner, Members, Projects === */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {/* Owner badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Owner:</span>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {workspace.owner.name}
                  </span>
                </div>

                {/* Members count badge */}
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Projects count badge (optional) */}
                {projects.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-slate-600">
                      {projects.length} project{projects.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* New Project button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl hover:shadow-md transition-all font-medium text-sm"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
            <span className="text-sm text-slate-500">{workspace.members.length} total</span>
          </div>

          <div className="space-y-3">
            {workspace.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{member.user.name}</p>
                    <p className="text-sm text-slate-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.role === "OWNER"
                      ? "bg-purple-100 text-purple-700"
                      : member.role === "MEMBER"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {member.role}
                  </span>
                  {workspace.owner.id === contextUserId && member.user.id !== workspace.owner.id && (
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={removingMember}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                    >
                      {removingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Member Form */}
          {workspace.owner.id === contextUserId && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:bg-slate-100"
                  disabled={allUsersLoading}
                >
                  <option value="" disabled>{allUsersLoading ? "Loading users..." : "Select a user"}</option>
                  {allUsers
                    .filter(u => !workspace.members.some(m => m.user.id === u.id))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>

                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as "MEMBER" | "VIEWER")}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>

                <button
                  onClick={handleAddMember}
                  disabled={addingMember || !selectedUserId}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  {addingMember ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
              <p className="text-slate-600 mt-1">All projects in this workspace</p>
            </div>
            {projects.length > 0 && (
              <span className="text-sm text-slate-500">{projects.length} project{projects.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Loading Projects */}
        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">Get started by creating your first project in this workspace.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl hover:shadow-md transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
      
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} workspaceId={id} />
      <EditWorkspaceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        workspace={workspace}
        onSave={handleUpdate}
        saving={updating}
      />
    </div>
  );
}