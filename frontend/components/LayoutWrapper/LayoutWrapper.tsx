"use client";

import React, { useMemo } from "react";
import { GRAPHQL_BASE_URL } from "@/lib/constants";
import {
  UrqlProvider,
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
} from "@urql/next";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  console.log("GRAPHQL_BASE_URL", GRAPHQL_BASE_URL);
  const apolloClient = new ApolloClient({
    uri: GRAPHQL_BASE_URL,
    cache: new InMemoryCache(),
  });

  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange({
      isClient: typeof window !== "undefined",
    });
    const client = createClient({
      url: GRAPHQL_BASE_URL,
      exchanges: [cacheExchange, ssr, fetchExchange],
      suspense: true,
    });
    console.log("GRAPHQL_BASE_URL_2", GRAPHQL_BASE_URL);

    return [client, ssr];
  }, []);
  return (
    <ChakraProvider>
      <UrqlProvider client={client} ssr={ssr}>
        <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
      </UrqlProvider>
    </ChakraProvider>
  );
};

export default LayoutWrapper;
