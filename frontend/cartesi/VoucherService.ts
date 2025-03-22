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
    validity: {
      inputIndexWithinEpoch: number;
      outputIndexWithinInput: number;
      outputHashesRootHash: string;
      vouchersEpochRootHash: string;
      noticesEpochRootHash: string;
      machineStateHash: string;
      outputHashInOutputHashesSiblings: string[];
      outputHashesInEpochSiblings: string[];
    };
    context: string;
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
  voucherIndex: number,
  inputIndex: number
): Promise<VoucherWithProof | null> => {
  const query = gql`
    query GetVoucher($voucherIndex: Int!, $inputIndex: Int!) {
      voucher(voucherIndex: $voucherIndex, inputIndex: $inputIndex) {
        index
        input {
          index
          payload
        }
        destination
        payload
        proof {
          validity {
            inputIndexWithinEpoch
            outputIndexWithinInput
            outputHashesRootHash
            vouchersEpochRootHash
            noticesEpochRootHash
            machineStateHash
            outputHashInOutputHashesSiblings
            outputHashesInEpochSiblings
          }
          context
        }
      }
    }
  `;

  // const result = await client
  //   .query(query, {
  //     voucherIndex,
  //     inputIndex,
  //   })
  //   .toPromise();

  const result = await client.query({
    fetchPolicy: "network-only",
    query,
    variables: { voucherIndex, inputIndex },
  });

  return result.data?.voucher || null;
};

export { createUrqlClient, getVouchers, getVoucherWithProof };
