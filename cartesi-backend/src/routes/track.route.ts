import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Notice, Output } from "cartesi-wallet";

import { TrackController } from "../controllers";

class CreateTrackRoute extends AdvanceRoute {
  track: TrackController;
  constructor(track: TrackController) {
    super();
    this.track = track;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      const track = this.track.createTrack(
        {
          walletAddress: signer,
          createdAt: new Date(request.metadata.timestamp * 1000),
          updatedAt: new Date(request.metadata.timestamp * 1000),
          releaseDate: new Date(request.metadata.timestamp * 1000),
          ...request_payload,
        },
        true
      ) as Notice | Error_out;

      return track;
    } catch (error) {
      const error_msg = `Failed to create track ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdateTrackRoute extends AdvanceRoute {
  track: TrackController;
  constructor(track: TrackController) {
    super();
    this.track = track;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      let { signer, ...request_payload } = this.request_args;
      if (!signer) {
        signer = this.msg_sender;
      }

      console.log("Executing Update track request");
      const updatedTrack = this.track.updateTrack(
        {
          walletAddress: signer,
          updatedAt: new Date(request.metadata.timestamp * 1000),
          ...request_payload,
        },
        true
      ) as Notice | Error_out;

      return updatedTrack;
    } catch (error) {
      const error_msg = `Failed to update message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeleteTrackRoute extends AdvanceRoute {
  track: TrackController;
  constructor(track: TrackController) {
    super();
    this.track = track;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.track.deleteTrack(parseInt(this.request_args.trackId));
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeleteTracksRoute extends AdvanceRoute {
  track: TrackController;
  constructor(track: TrackController) {
    super();
    this.track = track;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    try {
      return this.track.deleteTracks();
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class InspectRoute extends DefaultRoute {
  track: TrackController;
  constructor(track: TrackController) {
    super();
    this.track = track;
  }
}

class TracksRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.track.getTracks();
  };
}

class TrackRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.track.getTrack(parseInt(<string>request));
  };
}

export {
  UpdateTrackRoute,
  DeleteTrackRoute,
  DeleteTracksRoute,
  CreateTrackRoute,
  TracksRoute,
  TrackRoute,
};
