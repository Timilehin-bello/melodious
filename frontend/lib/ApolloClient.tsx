import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const graphqlUri = process.env.NEXT_PUBLIC_GRAPHQL_URI;

if (!graphqlUri) {
  throw new Error("No GraphQL URI provided");
}

const client = new ApolloClient({
  link: new HttpLink({
    uri: graphqlUri,
  }),
  cache: new InMemoryCache(),
});

export default client;
