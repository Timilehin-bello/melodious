import { hexToString } from "viem";
import { AdvanceRoute, DefaultRoute, Router } from "cartesi-router";
import { Wallet, Notice, Output, Error_out, Report } from "cartesi-wallet";
import viem from "viem";
import deployments from "./rollups.json";

import * as Controllers from "./controllers";
import * as Routes from "./routes";

let rollup_address = "";
const rollup_server: string = <string>process.env.ROLLUP_HTTP_SERVER_URL;

let Network: string = "localhost";
Network = <string>process.env.Network;
console.info("rollup server url is ", rollup_server, Network);
if (Network === undefined) {
  Network = "localhost";
}

const wallet = new Wallet(new Map());
const router = new Router(wallet);
var handlers: any = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

// User Route
const user = new Controllers.UserController();
router.addRoute("create_user", new Routes.CreateUserRoute(user));
router.addRoute("update_user", new Routes.UpdateUserRoute(user));
router.addRoute("get_users", new Routes.UsersRoute(user));
router.addRoute("get_user", new Routes.UserRoute(user));
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
// router.addRoute("delete_track", new DeleteTrackRoute(track));
// router.addRoute("delete_tracks", new DeleteTracksRoute(track));

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
    const msg_sender: string = data.metadata.msg_sender;
    console.log("msg sender is", msg_sender.toLowerCase());
    const payloadStr = hexToString(payload);

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
        return new Error_out(`failed ot process ERC20Deposit ${payload} ${e}`);
      }
    }

    try {
      const jsonpayload = JSON.parse(payloadStr);
      console.log("json payload is ", jsonpayload.method);
      console.log("payload is ", data);

      return router.process(jsonpayload.method, data);
    } catch (e) {
      return new Error_out(`failed to process command ${payloadStr} ${e}`);
    }
  } catch (e) {
    console.error(e);
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
