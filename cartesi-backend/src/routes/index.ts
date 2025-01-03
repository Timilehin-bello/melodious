import {
  CreateUserRoute,
  DeleteUserRoute,
  DeleteUsersRoute,
  UpdateUserRoute,
  UsersRoute,
  UserRoute,
} from "./user.route";

import {
  CreateAlbumRoute,
  DeleteAlbumRoute,
  DeleteAlbumsRoute,
  UpdateAlbumRoute,
  AlbumsRoute,
  AlbumRoute,
} from "./album.route";

import {
  CreateGenreRoute,
  DeleteGenreRoute,
  DeleteGenresRoute,
  UpdateGenreRoute,
  GenresRoute,
  GenreRoute,
} from "./genre.route";

import {
  CreateTrackRoute,
  DeleteTrackRoute,
  DeleteTracksRoute,
  UpdateTrackRoute,
  TracksRoute,
  TrackRoute,
} from "./track.route";

import { DepositVaultRoute, WithdrawalArtistVaultRoute } from "./vault.route";

import {
  ArtistDistributionRewardRoute,
  UpdateArtistListeningTimeForRewardRoute,
  ReferralRewardRoute,
} from "./reward.route";
import {
  CreateConfigRoute,
  UpdateConfigRoute,
  ConfigsRoute,
} from "./config.route";

export {
  // User
  CreateUserRoute,
  DeleteUserRoute,
  DeleteUsersRoute,
  UpdateUserRoute,
  UsersRoute,
  UserRoute,

  // Album
  CreateAlbumRoute,
  DeleteAlbumRoute,
  DeleteAlbumsRoute,
  UpdateAlbumRoute,
  AlbumsRoute,
  AlbumRoute,

  // Genre
  CreateGenreRoute,
  DeleteGenreRoute,
  DeleteGenresRoute,
  UpdateGenreRoute,
  GenresRoute,
  GenreRoute,

  //Track
  CreateTrackRoute,
  DeleteTrackRoute,
  DeleteTracksRoute,
  UpdateTrackRoute,
  TracksRoute,
  TrackRoute,

  // Vault
  DepositVaultRoute,
  WithdrawalArtistVaultRoute,

  // Reward
  ArtistDistributionRewardRoute,
  UpdateArtistListeningTimeForRewardRoute,
  ReferralRewardRoute,

  // Config
  CreateConfigRoute,
  UpdateConfigRoute,
  ConfigsRoute,
};
