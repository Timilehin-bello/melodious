import { hexToString } from "viem";

// Initialize Apollo Client
async function fetchNotices(request: string) {
  console.log("request", request);
  const url = "http://localhost:8080/graphql";
  const query = `
      query notices {
        notices {
          edges {
            node {
              index
              input {
                index
              }
              payload
            }
          }
        }
      }
    `;

  try {
    const response = await fetch(url, {
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
    const notices = responseData?.data.notices.edges;

    const result = [];

    // for (let i = 0; i < notices.length; i++) {
    //   const tx = JSON.parse(
    //     `${hexToString(notices[i].node.payload as `0x${string}`)}`
    //   );
    //   console.log("tx", tx);

    //   result.push(tx);
    //   console.log("result inside for loop", result);
    // }

    for (let i = 0; i < notices.length; i++) {
      const convertToString = hexToString(notices[i].node.payload);
      result.push(convertToString);
    }

    console.log("result", result);
    // return hexToString(notices);
  } catch (error) {
    console.log("Error fetching notices:", error);
  }
}

// function fetch_users(specific_tx: any) {
//   console.log("Fetching users 1....");
//   // console.log(specific_tx);
//   const user_methods = specific_tx.filter(
//     (tx: any) =>
//       tx.method == "create_user" ||
//       tx.method == "update_user" ||
//       tx.method == "get_user"
//   );
//   let highest_id;
//   for (let i = 0; i < user_methods.length; i++) {
//     highest_id = user_methods[i];
//     if (user_methods[i].tx_id > highest_id) {
//       highest_id = user_methods[i].tx_id;
//     }
//   }
//   // console.log("All Player Profiles: ", JSON.parse(highest_id?.data));
//   return highest_id.data ? JSON.parse(highest_id.data) : [];
// }

// function fetch_genres(specific_tx: any) {
//   // console.log(specific_tx);
//   const all_genre = specific_tx.filter(
//     (tx: any) =>
//       tx.method == "get_genres" ||
//       tx.method == "get_genre" ||
//       tx.method == "update_genre" ||
//       tx.method == "create_genre"
//   );
//   let highest_id;
//   for (let i = 0; i < all_genre.length; i++) {
//     highest_id = all_genre[i];
//     if (all_genre[i].tx_id > highest_id) {
//       highest_id = all_genre[i].tx_id;
//     }
//   }
//   // console.log("All Player Characters: ", JSON.parse(highest_id?.data));
//   return highest_id?.data ? JSON.parse(highest_id?.data) : [];
// }

// function fetch_albums(specific_tx: any) {
//   console.log(specific_tx);
//   const all_albums = specific_tx.filter(
//     (tx: any) =>
//       tx.method == "create_album" ||
//       tx.method == "get_albums" ||
//       tx.method == "get_album" ||
//       tx.method == "update_album"
//   );
//   console.log("all albums are:", all_albums);
//   let highest_id = all_albums[0];

//   for (let i = 0; i < all_albums.length; i++) {
//     // highest_id = all_duels[i];
//     console.log(JSON.parse(all_albums[i].data)[i]);
//     if (all_albums[i].tx_id > highest_id.tx_id) {
//       console.log("yessss");
//       highest_id = all_albums[i];
//     } else {
//       console.log("no");
//     }
//   }
//   // console.log("All Player Characters: ", JSON.parse(highest_id));
//   console.log("All albums: ", JSON.parse(highest_id.data));
//   return highest_id?.data ? JSON.parse(highest_id?.data) : [];
// }

// function fetch_tracks(all_tx: any) {
//   console.log(all_tx);
//   let highest_id;
//   for (let i = 0; i < all_tx.length; i++) {
//     highest_id = all_tx[i];
//     if (all_tx[i].tx_id > highest_id) {
//       highest_id = all_tx[i].tx_id;
//     }
//   }
//   // console.log("All Player Characters: ", JSON.parse(highest_id?.data));
//   // console.log("All Player Characters: ", (highest_id));
//   return highest_id?.data ? JSON.parse(highest_id?.data) : [];
// }

export default fetchNotices;
