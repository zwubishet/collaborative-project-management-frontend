import { gql } from "@apollo/client";

export const GET_ALL_USERS = gql`
  query GetAllUsers {
  users {
    id
    name
    email
  }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      createdAt
    }
  }
`;

export const GET_WORKSPACES = gql`
  query MyWorkspaces {
    myWorkspaces {
      id
      name
      description
      createdAt
      updatedAt
      owner {
        id
        name
        email
      }
      members {
        user {
          id
          name
          email
        }
      }
      projects {
        id
        name
        status
      }
    }
  }
`;

export const GET_WORKSPACE = gql`
  query GetWorkspace($id: Int!) {
    workspace(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      owner {
        id
        name
        email
      }
      members {
        id
        role
        user {
          id
          name
          email
        }
      }
     projects {
        id
        name
        status
      }
    }
  }
`;

export const GET_WORKSPACE_PROJECTS = gql`
query GetWorkspaceProjects($workspaceId: Int!) {
  workspaceProjects(workspaceId: $workspaceId) {
    id
    name
    description
    status
    createdAt
    updatedAt
    members {
      id
      role
      user {
        id
        name
        email
      }
    }
    tasks {
      id
      title
      status
    }
  }
}
`;

export const GET_PROJECT = gql`
  query GetProject($projectId: Int!) {
    project(projectId: $projectId) {
      id
      name
      description
      status
      createdAt
      updatedAt
      workspace {
        id
        name
      }
      tasks {
        id
        title
        description
        status
        createdAt
        updatedAt
        priority
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
  }
`;
export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      project {
          id
          name
          workspace {
            id
            name
          }
        }
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
