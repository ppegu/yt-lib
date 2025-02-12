/**
 * @module yt-lib/youtube-search
 * @description This module provides a class to search for videos on YouTube.
 * @author Pran pegu
 * @email pranpegu997@gmail.com
 */

import { YOUTUBE_ITEM_TYPES } from "../../constants/index";

export type YoutubeItemType =
  (typeof YOUTUBE_ITEM_TYPES)[keyof typeof YOUTUBE_ITEM_TYPES];

export type YoutubeSearchOptions = {
  query: string;
  limit?: number;
  type?: YoutubeItemType;
  device?: "mobile" | "desktop";
};

export type YoutubeSearchResult = {
  id: string;
  videoId?: string;
  playlistId?: string;
  channelId?: string;
  type: YoutubeItemType;
  thumbnail?: string;
  title: string;
  creatorName?: string;
  creatorUrl?: string;
  description?: string;
  ago?: string;
  views?: string;
  url: string;
};
