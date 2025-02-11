export type YoutubeSearchOptions = {
  query: string;
  limit?: number;
  type?: "video" | "playlist" | "channel" | "short";
  device?: "mobile" | "desktop";
};
