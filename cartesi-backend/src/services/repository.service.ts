import * as Model from "../models";
import { Notice } from "cartesi-wallet";

class RepositoryService {
  static users: Model.User[] = [];
  static albums: Model.Album[] = [];
  static genres: Model.Genre[] = [];
  static tracks: Model.Track[] = [];
  static artists: Model.Artist[] = [];
  static listeners: Model.Listener[] = [];
  static playlists: Model.Playlist[] = [];
  static referrals: Model.Referral[] = [];
  static referralTransactions: Model.ReferralTransaction[] = [];
  static config: Model.Config | null = null;

  // Auto-notice configuration
  static enableAutoNotices = true;
  static noticeQueue: Notice[] = [];

  // Generate complete repository snapshot
  static generateRepositorySnapshot(): any {
    return {
      users: this.users,
      albums: this.albums,
      genres: this.genres,
      tracks: this.tracks,
      artists: this.artists,
      listeners: this.listeners,
      playlists: this.playlists,
      referrals: this.referrals,
      referralTransactions: this.referralTransactions,
      config: this.config,
      stats: {
        usersCount: this.users.length,
        albumsCount: this.albums.length,
        genresCount: this.genres.length,
        tracksCount: this.tracks.length,
        artistsCount: this.artists.length,
        listenersCount: this.listeners.length,
        playlistsCount: this.playlists.length,
        referralsCount: this.referrals.length,
        referralTransactionsCount: this.referralTransactions.length,
        hasConfig: !!this.config,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Create repository notice with full data
  static createRepositoryNotice(changeType: string, changedData?: any): Notice {
    const snapshot = this.generateRepositorySnapshot();
    const notice_payload = JSON.stringify({
      type: "repository_update",
      content: {
        changeType,
        changedData,
        repository: snapshot,
      },
    });

    const notice = new Notice(notice_payload);

    if (this.enableAutoNotices) {
      this.noticeQueue.push(notice);
    }

    return notice;
  }

  // Helper method for specific data type notices
  static createDataNotice(dataType: string, action: string, data: any): Notice {
    const currentData =
      (this[dataType as keyof typeof RepositoryService] as any[]) || [];
    const notice_payload = JSON.stringify({
      type: `repository_${dataType}_${action}`,
      content: {
        action,
        data,
        [dataType]: currentData,
        count: currentData.length,
        timestamp: new Date().toISOString(),
      },
    });

    return new Notice(notice_payload);
  }

  // Get queued notices
  static getQueuedNotices(): Notice[] {
    const notices = [...this.noticeQueue];
    this.noticeQueue = [];
    return notices;
  }

  // Toggle auto-notices
  static setAutoNotices(enabled: boolean): void {
    this.enableAutoNotices = enabled;
  }
}

export { RepositoryService };
