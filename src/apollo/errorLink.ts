import { onError } from "@apollo/client/link/error";

export const errorLink = onError((error: any) => {
  const { graphQLErrors, networkError, operation, forward } = error;

  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Handle expired token error from backend
      if (err.extensions?.code === "UNAUTHENTICATED") {
        // Try refreshing token (don't return the Promise so the handler stays synchronous)
        fetch("http://localhost:4000/auth/refresh", {
          method: "POST",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.accessToken) {
              localStorage.setItem("authToken", data.accessToken);

              // Update the failed request with new token
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: `Bearer ${data.accessToken}`,
                },
              }));

              // Note: returning forward(operation) here would return a Promise,
              // which is not allowed by the onError handler type; to retry the
              // operation you can re-execute it via your Apollo client instance
              // outside this handler if needed.
            }
          })
          .catch(() => {
            localStorage.removeItem("authToken");
          });
      }
    }
  }

  if (networkError) console.error(`[Network error]: ${networkError}`);
});
