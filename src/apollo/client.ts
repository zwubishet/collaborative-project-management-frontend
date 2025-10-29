import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
  from,
  ApolloLink,
  FetchResult,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { errorLink } from "./errorLink";
import { map } from "rxjs/operators"; // ← rxjs

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_HTTP_URL || "http://localhost:4000/graphql",
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("authToken");
console.log("Sending token:", token ? "present" : "missing");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const tokenRefreshLink = new ApolloLink((operation, forward) => {
  return forward(operation).pipe(
    map((response: FetchResult) => {
  const context = operation.getContext();
  const newToken = context.response?.headers?.get("x-access-token");

  if (newToken) {
    console.log("New token received:", newToken);
    localStorage.setItem("authToken", newToken);
  } else {
    console.log("No new token in response");
  }

  return response;
})
  );
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL || "ws://localhost:4000/graphql",
    connectionParams: () => {
      const token = localStorage.getItem("authToken");
      return {
        authorization: token ? `Bearer ${token}` : "",
      };
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === "OperationDefinition" && def.operation === "subscription";
  },
  wsLink,
  from([
    authLink,         // ← 1. Add token
    tokenRefreshLink, // ← 2. Refresh if needed
    errorLink,        // ← 3. Handle errors
    httpLink          // ← 4. Send request
  ])
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});