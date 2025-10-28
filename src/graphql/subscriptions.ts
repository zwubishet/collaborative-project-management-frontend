import { gql } from "@apollo/client";

export const TASK_UPDATED_SUBSCRIPTION = gql`
  subscription TaskUpdated($projectId: ID!) {
    taskUpdated(projectId: $projectId) {
      id
      title
      description
      status
      priority
      dueDate
      updatedAt
      assignee {
        id
        name
        email
      }
    }
  }
`;

export const PROJECT_UPDATED_SUBSCRIPTION = gql`
  subscription ProjectUpdated($workspaceId: ID!) {
    projectUpdated(workspaceId: $workspaceId) {
      id
      name
      description
      status
      updatedAt
    }
  }
`;

export const WORKSPACE_UPDATED_SUBSCRIPTION = gql`
  subscription WorkspaceUpdated {
    workspaceUpdated {
      id
      name
      description
      updatedAt
      members {
        id
        name
        email
      }
    }
  }
`;
