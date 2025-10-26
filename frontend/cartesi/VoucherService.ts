import { ApolloClient, gql } from "@apollo/client";
import { createClient, Client, fetchExchange } from "urql";

interface VoucherEdge {
  node: {
    index: number;
    input: {
      index: number;
      payload: string;
    };
    payload: string;
    proof: {
      context: string;
    };
  };
  cursor: string;
}

interface VoucherData {
  vouchers: {
    edges: VoucherEdge[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
}

interface VoucherWithProof {
  index: number;
  input: {
    index: number;
    payload: string;
  };
  destination: string;
  payload: string;
  proof: {
    outputIndex: number;
    outputHashesSiblings: string[];
  };
}

const createUrqlClient = (): Client => {
  return createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URI as string,
    exchanges: [fetchExchange],
  });
};

const getVouchers = async (client: Client): Promise<VoucherEdge[]> => {
  const query = `
  {   
    vouchers {
      edges {
        node {
          index
          input{
            index
            payload
          }
          payload
          proof{
            context
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  `;

  const result = await client.query(query, {}).toPromise();

  if (!result || !result.data?.vouchers.edges) {
    return [];
  }
  return result.data.vouchers.edges;
};

const getVoucherWithProof = async (
  client: ApolloClient<any>,
  // client: Client,
  outputIndex: number
): Promise<VoucherWithProof | null> => {
  const query = gql`
    query GetVoucher($outputIndex: Int!) {
      voucher(outputIndex: $outputIndex) {
        index
        input {
          index
          payload
        }
        destination
        payload
        proof {
          outputIndex
          outputHashesSiblings
        }
      }
    }
  `;

  const result = await client.query({
    query,
    variables: {
      outputIndex,
    },
    fetchPolicy: "network-only",
  });
  console.log("result getVoucherWithProof test", result);
  return result.data?.voucher || null;
};

export { createUrqlClient, getVouchers, getVoucherWithProof };
