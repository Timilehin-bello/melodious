export type Voucher = {
  id: string;
  index: number;
  payload: string;
  destination: string;
  value: string;
  executed: boolean;
  transactionHash?: string;
  proof: any;
  application: {
    id: string;
    name: string;
    address: string;
  };
  input: {
    id: string;
    index: number;
  };
};

export async function fetchVouchers() {
  const url = process.env.NEXT_PUBLIC_GRAPHQL_URI as string;
  const query = `
        query vouchers {
        vouchers {
            edges {
            node {
                id
                index
                input {
                id
                index
                }
                destination
                payload
                value
                executed
                transactionHash
                application {
                id
                name
                address
                }
                proof {
                validity {
                    outputIndex
                    outputHashesSiblings
                }
                context
                }
            }
            }
        }
        }
    `;

  try {
    const response = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    const vouchers = responseData?.data.vouchers.edges;

    const all_Vouchers: Voucher[] = [];

    for (let i = 0; i < vouchers.length; i++) {
      const node = vouchers[i].node;
      const id = node.id;
      const index = node.index;
      const payload = node.payload;
      const destination = node.destination;
      const value = node.value;
      const executed = node.executed;
      const transactionHash = node.transactionHash;
      const proof = node.proof;
      const application = node.application;
      const input = node.input;

      all_Vouchers.push({
        id: id,
        index: index,
        payload: payload,
        destination: destination,
        value: value,
        executed: executed,
        transactionHash: transactionHash,
        proof: proof,
        application: application,
        input: input,
      });
    }
    return all_Vouchers;
  } catch (error) {
    console.log("Error fetching notices:", error);
  }
}
