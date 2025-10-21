import { hexToString } from "viem";
import { Router } from "cartesi-router";
import { Wallet, Notice, Output, Error_out } from "cartesi-wallet";
import deployments from "./rollups.json";

import * as Controllers from "./controllers";
import * as Routes from "./routes";
import { RepositoryService } from "./services/repository.service";

let rollup_address = "";
const rollup_server: string = <string>process.env.ROLLUP_HTTP_SERVER_URL;

let Network: string = "localhost";
Network = <string>process.env.Network;
if (Network === undefined) {
  Network = "localhost";
}
console.info("rollup server url is ", rollup_server, Network);

const wallet = new Wallet(new Map());
const router = new Router(wallet);
var handlers: any = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

// const configService = new ConfigService();
// const configResult = configService.createConfig({
//   adminWalletAddresses: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
//   cartesiTokenContractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
//   vaultContractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
//   artistPercentage: 70,
//   poolPercentage: 30,
//   feesPercentage: 2,
//   serverAddress: "0x0000000000000000000000000000000000000000",
//   dappContractAddress: "0x0000000000000000000000000000000000000000",
//   melodiousNftAddress: "0x0000000000000000000000000000000000000000",
// });
// console.log("config result is ", configResult);
// if (configResult instanceof Error_out) {
//   console.log(configResult);
//   process.exit(1);
// }

// User Route
const user = new Controllers.UserController();
router.addRoute("create_user", new Routes.CreateUserRoute(user));
router.addRoute("update_user", new Routes.UpdateUserRoute(user));
router.addRoute("get_users", new Routes.UsersRoute(user));
router.addRoute("get_user", new Routes.UserRoute(user));
router.addRoute("get_user_info", new Routes.UserInfoRoute(user));
// router.addRoute("delete_user", new Routes.DeleteUserRoute(user));
// router.addRoute("delete_users", new Routes.DeleteUsersRoute(user));

//Genre Route
const genre = new Controllers.GenreController();
router.addRoute("create_genre", new Routes.CreateGenreRoute(genre));
router.addRoute("update_genre", new Routes.UpdateGenreRoute(genre));
router.addRoute("get_genres", new Routes.GenresRoute(genre));
router.addRoute("get_genre", new Routes.GenreRoute(genre));
// router.addRoute("delete_genre", new Routes.DeleteGenreRoute(genre));
// router.addRoute("delete_genres", new Routes.DeleteGenresRoute(genre));

// Album Route
const album = new Controllers.AlbumController();
router.addRoute("create_album", new Routes.CreateAlbumRoute(album));
router.addRoute("update_album", new Routes.UpdateAlbumRoute(album));
router.addRoute("get_albums", new Routes.AlbumsRoute(album));
router.addRoute("get_album", new Routes.AlbumRoute(album));
// router.addRoute("delete_album", new DeleteAlbumRoute(album));
// router.addRoute("delete_albums", new DeleteAlbumsRoute(album));

// Track Route
const track = new Controllers.TrackController();
router.addRoute("create_track", new Routes.CreateTrackRoute(track));
router.addRoute("update_track", new Routes.UpdateTrackRoute(track));
router.addRoute("get_tracks", new Routes.TracksRoute(track));
router.addRoute("get_track", new Routes.TrackRoute(track));
router.addRoute(
  "get_tracks_by_wallet_address",
  new Routes.TrackByWalletAddressRoute(track)
);
// router.addRoute("delete_track", new DeleteTrackRoute(track));
// router.addRoute("delete_tracks", new DeleteTracksRoute(track));

// Vault Route
const vault = new Controllers.VaultController();
router.addRoute("vault_deposit", new Routes.DepositVaultRoute(vault));
router.addRoute("withdraw_reward", new Routes.WithdrawalRewardRoute(vault));

// Reward Route
const reward = new Controllers.ListeningRewardController();
router.addRoute(
  "distribute_reward_to_artists",
  new Routes.ArtistDistributionRewardRoute(reward)
);

router.addRoute(
  "update_artist_listening_time",
  new Routes.UpdateArtistListeningTimeForRewardRoute(reward)
);

// router.addRoute(
//   "distribute_referral_reward",
//   new Routes.ReferralRewardRoute(reward)
// );

// Config Route
const config = new Controllers.ConfigController();
router.addRoute("create_config", new Routes.CreateConfigRoute(config));
router.addRoute("update_config", new Routes.UpdateConfigRoute(config));
router.addRoute("get_config", new Routes.ConfigsRoute(config));

// Playlist Route
const playlist = new Controllers.PlaylistController();
router.addRoute("create_playlist", new Routes.CreatePlaylistRoute(playlist));
router.addRoute("update_playlist", new Routes.UpdatePlaylistRoute(playlist));
router.addRoute("delete_playlist", new Routes.DeletePlaylistRoute(playlist));
router.addRoute(
  "add_track_to_playlist",
  new Routes.AddTrackToPlaylistRoute(playlist)
);
router.addRoute(
  "remove_track_from_playlist",
  new Routes.RemoveTrackFromPlaylistRoute(playlist)
);
router.addRoute("get_playlists", new Routes.PlaylistsRoute(playlist));
router.addRoute("get_playlist", new Routes.PlaylistRoute(playlist));
router.addRoute(
  "get_playlists_by_listener",
  new Routes.PlaylistsByListenerRoute(playlist)
);
router.addRoute(
  "get_playlists_by_wallet",
  new Routes.PlaylistsByWalletRoute(playlist)
);

// Referral routes
const referral = new Controllers.ReferralController();
router.addRoute(
  "convert_melo_to_ctsi",
  new Routes.ConvertMeloToCtsiRoute(referral)
);
router.addRoute("process_referral", new Routes.ProcessReferralRoute(referral));
router.addRoute("get_referral_stats", new Routes.ReferralStatsRoute(referral));
router.addRoute("get_user_referrals", new Routes.UserReferralsRoute(referral));
router.addRoute(
  "get_referral_transactions",
  new Routes.ReferralTransactionsRoute(referral)
);
router.addRoute(
  "validate_referral_code",
  new Routes.ValidateReferralCodeRoute(referral)
);
router.addRoute(
  "get_conversion_info",
  new Routes.ConversionInfoRoute(referral)
);

// NFT Route
const nft = new Controllers.NFTController();
router.addRoute("mint_track_nft", new Routes.MintTrackNFTRoute(nft));
router.addRoute("mint_artist_tokens", new Routes.MintArtistTokensRoute(nft));
router.addRoute(
  "purchase_artist_tokens",
  new Routes.PurchaseArtistTokensRoute(nft)
);
router.addRoute("get_track_nft", new Routes.GetTrackNFTRoute(nft));
router.addRoute("get_artist_tokens", new Routes.GetArtistTokensRoute(nft));
router.addRoute(
  "get_artist_token_purchases",
  new Routes.GetArtistTokenPurchasesRoute(nft)
);
router.addRoute("get_nft_stats", new Routes.GetNFTStatsRoute(nft));

// Subscription Route
const subscription = new Controllers.SubscriptionController();
router.addRoute("subscribe", new Routes.SubscribeRoute(subscription));
router.addRoute(
  "get_subscription",
  new Routes.GetSubscriptionRoute(subscription)
);
router.addRoute(
  "get_all_subscriptions",
  new Routes.GetAllSubscriptionsRoute(subscription)
);

const send_request = async (output: Output | Set<Output>) => {
  if (output instanceof Output) {
    let endpoint;
    console.log("type of output", output.type);

    if (output.type == "notice") {
      endpoint = "/notice";
    } else if (output.type == "voucher") {
      endpoint = "/voucher";
    } else {
      endpoint = "/report";
    }

    console.log(`sending request ${typeof output}`);
    const response = await fetch(rollup_server + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(output),
    });
    console.debug(
      `received ${output.payload} status ${response.status} body ${response.body}`
    );
  } else {
    output.forEach((value: Output) => {
      send_request(value);
    });
  }
};

async function handle_advance(data: any) {
  console.log("Received advance request data " + JSON.stringify(data));
  try {
    const payload = data.payload;
    console.log("payload is", payload);
    const payloadStr = hexToString(payload);
    console.log("payloadStr is", payloadStr);

    let msg_sender: string = data.metadata.msg_sender;

    console.log("msg sender is", msg_sender.toLowerCase());

    if (
      msg_sender.toLowerCase() ===
      deployments.contracts.EtherPortal.address.toLowerCase()
    ) {
      try {
        return router.process("ether_deposit", payload);
      } catch (e) {
        return new Error_out(`failed to process ether deposit ${payload} ${e}`);
      }
    }
    if (
      msg_sender.toLowerCase() ===
      deployments.contracts.DAppAddressRelay.address.toLowerCase()
    ) {
      rollup_address = payload;
      router.set_rollup_address(rollup_address, "ether_withdraw");
      router.set_rollup_address(rollup_address, "erc20_withdraw");
      router.set_rollup_address(rollup_address, "erc721_withdraw");
      // router.set_rollup_address(rollup_address, "erc1155_withdraw");
      // router.set_rollup_address(rollup_address, "erc1155_batch_withdraw");

      console.log("Setting DApp address");
      return new Notice(
        `DApp address set up successfully to ${rollup_address}`
      );
    }

    if (
      msg_sender.toLowerCase() ===
      deployments.contracts.ERC20Portal.address.toLowerCase()
    ) {
      try {
        return router.process("erc20_deposit", payload);
      } catch (e) {
        return new Error_out(`failed ot process ERC20Deposit ${payload} ${e}`);
      }
    }

    if (
      msg_sender.toLowerCase() ===
      deployments.contracts.ERC721Portal.address.toLowerCase()
    ) {
      try {
        return router.process("erc721_deposit", payload);
      } catch (e) {
        return new Error_out(`failed to process ERC721Deposit ${payload} ${e}`);
      }
    }

    if (
      msg_sender.toLowerCase() ===
      deployments.contracts.ERC1155SinglePortal.address.toLowerCase()
    ) {
      try {
        return router.process("erc1155_deposit", payload);
      } catch (e) {
        return new Error_out(
          `failed to process ERC1155SinglePortal ${payload} ${e}`
        );
      }
    }

    if (
      msg_sender.toLowerCase() ===
      deployments.contracts.ERC1155BatchPortal.address.toLowerCase()
    ) {
      try {
        return router.process("erc1155_batch_deposit", payload);
      } catch (e) {
        return new Error_out(
          `failed to process ERC1155BatchPortal ${payload} ${e}`
        );
      }
    }

    try {
      const jsonpayload = JSON.parse(payloadStr);
      console.log("json payload is ", jsonpayload.method);
      console.log("payload is ", data);

      // Handle signer override for JSON payloads
      if (jsonpayload?.args?.signer !== undefined) {
        console.log(
          `The original message sender: ${data.metadata.msg_sender} has been updated to: ${jsonpayload.args.signer}`
        );
        data.metadata.msg_sender = jsonpayload.args.signer.toLowerCase();
      }

      const result = router.process(jsonpayload.method, data);

      // Emit any queued notices after processing the route
      const queuedNotices = RepositoryService.getQueuedNotices();
      if (queuedNotices.length > 0) {
        console.log(`Emitting ${queuedNotices.length} queued notices`);
        queuedNotices.forEach((notice) => {
          send_request(notice);
        });
      }

      return result;
    } catch (e) {
      return new Error_out(`failed to process command ${payloadStr} ${e}`);
    }
  } catch (e) {
    console.log(e);
    return new Error_out(`failed to process advance_request ${e}`);
  }
}

async function handle_inspect(data: any) {
  console.debug(`received inspect request data${data}`);
  try {
    const url = hexToString(data.payload).split("/");
    console.log("url is ", url);
    return router.process(<string>url[0], url[1]);
  } catch (e) {
    const error_msg = `failed to process inspect request ${e}`;
    console.debug(error_msg);
    return new Error_out(error_msg);
  }
}

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();

      var typeq = rollup_req.request_type;
      var handler: any;
      if (typeq === "inspect_state") {
        handler = handlers.inspect_state;
      } else {
        handler = handlers.advance_state;
      }
      var output = await handler(rollup_req.data);
      finish.status = "accept";
      if (output instanceof Error_out) {
        finish.status = "reject";
      }
      console.log(output);
      console.log(output instanceof Output);
      await send_request(output);
    }
  }
})();
