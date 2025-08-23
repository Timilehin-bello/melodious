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

import {
  CreateSubscriptionPlanRoute,
  SubscriptionPaymentRoute,
  RenewSubscriptionRoute,
  CancelSubscriptionRoute,
  GetSubscriptionPlansRoute,
  GetSubscriptionRoute,
  GetListenerSubscriptionRoute,
  GetActiveSubscriptionsRoute,
  GetExpiredSubscriptionsRoute,
  InitializeDefaultPlansRoute,
} from "./subscription.route";

import {
  RegisterVoucherRoute,
  UpdateVoucherStatusRoute,
  GetVoucherStatusRoute,
  GetPendingVouchersRoute,
  GetWalletVoucherHistoryRoute,
  GetVoucherStatisticsRoute,
  CleanupOldVouchersRoute
} from "./voucher.route";

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
  WithdrawalArtistVaultRoute,

  // Reward
  ArtistDistributionRewardRoute,
  UpdateArtistListeningTimeForRewardRoute,
  ReferralRewardRoute,

  // Config routes
  CreateConfigRoute,
  UpdateConfigRoute,
  ConfigsRoute,
  // Subscription routes
  CreateSubscriptionPlanRoute,
  SubscriptionPaymentRoute,
  RenewSubscriptionRoute,
  CancelSubscriptionRoute,
  GetSubscriptionPlansRoute,
  GetSubscriptionRoute,
  GetListenerSubscriptionRoute,
  GetActiveSubscriptionsRoute,
  GetExpiredSubscriptionsRoute,
  InitializeDefaultPlansRoute,
  // Voucher routes
  RegisterVoucherRoute,
  UpdateVoucherStatusRoute,
  GetVoucherStatusRoute,
  GetPendingVouchersRoute,
  GetWalletVoucherHistoryRoute,
  GetVoucherStatisticsRoute,
  CleanupOldVouchersRoute,
};
