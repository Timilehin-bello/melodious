export type Track = {
  id: number;
  title: string;
  duration?: any;
  genreId?: number;
  imageUrl: string;
  audioUrl: string;
  isrcCode?: string;
  isPublished?: string;
  artist?: string;
};

export type Albums = {
  title: string;
  imageUrl: string;
  genreId: number;
  label: string;
  isPublished: boolean;
  tracks: Array<{
    title: string;
    imageUrl: string;
    genreId: number;
    audioUrl: string;
    isrcCode: number;
    duration: number;
    isPublished: boolean;
  }>;
};

export type Playlist = {};
