/**
 * @module yt-lib
 * @description Constants for the library
 * @author Pran pegu
 * @email pranpegu997@gmail.com
 */

export const YOUTUBE_URLS = {
  HOME_PAGE: "https://www.youtube.com",
  SEARCH_QUERY_MOBILE: "https://m.youtube.com/results?search_query=",
  SEARCH_QUERY_DESKTOP: "https://www.youtube.com/results?search_query=",
};

export const DEFAULT_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
  "accept-encoding": "gzip",
  accept: "text/html",
};

export const YOUTUBE_ITEM_TYPES = {
  VIDEO: "video",
  PLAYLIST: "playlist",
  CHANNEL: "channel",
  SHORT: "short",
  UNKNOWN: "unknown",
} as const;
