import {
  CreateUserRoute,
  DeleteUserRoute,
  DeleteUsersRoute,
  UpdateUserRoute,
  UsersRoute,
  UserRoute,
  UserInfoRoute,
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
  TrackByWalletAddressRoute,
} from "./track.route";

import { DepositVaultRoute, WithdrawalRewardRoute } from "./vault.route";

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

import {
  CreatePlaylistRoute,
  UpdatePlaylistRoute,
  DeletePlaylistRoute,
  AddTrackToPlaylistRoute,
  RemoveTrackFromPlaylistRoute,
  PlaylistsRoute,
  PlaylistRoute,
  PlaylistsByListenerRoute,
  PlaylistsByWalletRoute,
} from "./playlist.route";

import {
  ConvertMeloToCtsiRoute,
  ProcessReferralRoute,
  ReferralStatsRoute,
  UserReferralsRoute,
  ReferralTransactionsRoute,
  ValidateReferralCodeRoute,
  ConversionInfoRoute,
} from "./referral.route";

import {
  MintTrackNFTRoute,
  MintArtistTokensRoute,
  PurchaseArtistTokensRoute,
  GetTrackNFTRoute,
  GetArtistTokensRoute,
  GetArtistTokenPurchasesRoute,
  GetNFTStatsRoute,
} from "./nft.route";

export {
  // User
  CreateUserRoute,
  DeleteUserRoute,
  DeleteUsersRoute,
  UpdateUserRoute,
  UsersRoute,
  UserRoute,
  UserInfoRoute,

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
  TrackByWalletAddressRoute,

  // Vault
  DepositVaultRoute,
  WithdrawalRewardRoute,

  // Reward
  ArtistDistributionRewardRoute,
  UpdateArtistListeningTimeForRewardRoute,
  ReferralRewardRoute,

  // Config routes
  CreateConfigRoute,
  UpdateConfigRoute,
  ConfigsRoute,

  // Playlist routes
  CreatePlaylistRoute,
  UpdatePlaylistRoute,
  DeletePlaylistRoute,
  AddTrackToPlaylistRoute,
  RemoveTrackFromPlaylistRoute,
  PlaylistsRoute,
  PlaylistRoute,
  PlaylistsByListenerRoute,
  PlaylistsByWalletRoute,

  // Referral routes
  ConvertMeloToCtsiRoute,
  ProcessReferralRoute,
  ReferralStatsRoute,
  UserReferralsRoute,
  ReferralTransactionsRoute,
  ValidateReferralCodeRoute,
  ConversionInfoRoute,

  // NFT routes
  MintTrackNFTRoute,
  MintArtistTokensRoute,
  PurchaseArtistTokensRoute,
  GetTrackNFTRoute,
  GetArtistTokensRoute,
  GetArtistTokenPurchasesRoute,
  GetNFTStatsRoute,
};
