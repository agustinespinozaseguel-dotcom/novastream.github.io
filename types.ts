
export type VideoQuality = '360p' | '720p' | '1080p' | '4K';

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: string;
}

export interface User {
  username: string;
  avatar: string;
  subscriptions: string[]; // List of author names this user follows
  likedVideos: string[]; // List of video IDs this user liked
  playlists: Playlist[];
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  author: string;
  uploadedAt: string;
  qualities: VideoQuality[];
  category: string;
}

export interface GlobalAuthorStats {
  [authorName: string]: {
    subscriberCount: number;
    videoCount: number;
    avatar?: string;
  };
}
