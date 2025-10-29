import { gql } from "@apollo/client";

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
    }
  }
`;

export const GET_WORKSPACE = gql`
  query GetWorkspace($id: Int!) {
    workspace(id: $id) {
      id
      name
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
    }
  }
`;




export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
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
        priority
        dueDate
        createdAt
        updatedAt
        assignee {
          id
          name
          email
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
      assignee {
        id
        name
        email
      }
    }
  }
`;
