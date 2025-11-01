import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        name
        email
      }
    }
  }
`;

export const SEND_RESET_PASSWORD_MUTATION = gql`
  mutation SendResetPassword($email: String!) {
    sendResetPassword(email: $email)
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($name: String!, $description: String) {
    createWorkspace(name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($id: ID!, $name: String, $description: String) {
    updateWorkspace(id: $id, name: $name, description: $description) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_WORKSPACE = gql`
  mutation DeleteWorkspace($id: ID!) {
    deleteWorkspace(id: $id)
  }
`;

export const ADD_WORKSPACE_MEMBER = gql`
  mutation addMember($workspaceId: Int!, $userId: Int!, $role: String!) {
    addMember(workspaceId: $workspaceId, userId: $userId, role: $role) {
      id
      user {
        id
        name
        email
      }
      role
    }
  }
`;


export const REMOVE_WORKSPACE_MEMBER = gql`
  mutation removeMember($workspaceId: Int!, $userId: Int!) {
    removeMember(workspaceId: $workspaceId, userId: $userId)
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($workspaceId: Int!, $name: String!, $description: String, $status: String) {
    createProject(workspaceId: $workspaceId, name: $name, description: $description, status: $status) {
      id
      name
      description
      status
      createdAt
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $name: String, $description: String, $status: String) {
    updateProject(id: $id, name: $name, description: $description, status: $status) {
      id
      name
      description
      status
      updatedAt
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const Add_TASK = gql`
mutation AddTask($input: AddTaskInput!) {
  addTask(input: $input) {
    id
    title
    description
    status
    priority
    dueDate
  }
}
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $status: String, $priority: String, $dueDate: String, $assigneeId: ID) {
    updateTask(id: $id, title: $title, description: $description, status: $status, priority: $priority, dueDate: $dueDate, assigneeId: $assigneeId) {
      id
      title
      description
      status
      priority
      dueDate
      updatedAt
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const ASSIGN_TASK_MEMBER = gql`
  mutation AssignTaskMember($taskId: Int!, $userId: Int!) {
    assignTaskMember(taskId: $taskId, userId: $userId) {
      id
      title
     assignees {
  id
  user {
    id
    name
    email
  }
}
    }
  }
`;

export const REMOVE_TASK_MEMBER = gql`
  mutation RemoveTaskMember($taskId: Int!, $userId: Int!) {
    removeTaskMember(taskId: $taskId, userId: $userId) {
      id
      title
      assignees {
        id
        name
      }
    }
  }
`;


