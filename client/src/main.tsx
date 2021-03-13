import React from "react";
import ReactDOM from "react-dom";
// import ApolloClient from "apollo-boost";
// import { ApolloProvider } from "@apollo/react-hooks";
import { getAccessToken, setAccessToken } from "./accessToken";
import { App } from "./app";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const accessToken = getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `bearer ${accessToken}` : "",
    },
  };
});

const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: "accessToken",
      isTokenValidOrUndefined: () => {
        const token = getAccessToken();
        if (!token) {
          return true;
        }

        try {
          const { exp }: { exp: number } = jwtDecode(token);
          if (Date.now() >= exp * 1000) {
            return false;
          } else {
            return true;
          }
        } catch (error) {
          return false;
        }
      },
      fetchAccessToken: () => {
        return fetch(`http://localhost:4000/refresh_token`, {
          credentials: "include",
          method: "POST",
        });
      },
      handleFetch: (accessToken) => {
        setAccessToken(accessToken)
      },
      handleError: (err) => {
        // full control over handling token fetch Error
        console.warn("Your refresh token is invalid. Try to relogin");
        console.error(err);
      },
    }),
    onError(({ graphQLErrors, networkError }) => {
      console.log(graphQLErrors);
      console.log(networkError);
    }),
    authLink,
    httpLink,
  ]),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
