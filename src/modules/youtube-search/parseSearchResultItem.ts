/**
 * @module yt-lib/youtube-search
 * @description This module provides a class to search for videos on YouTube.
 * @author Pran pegu
 * @email pranpegu997@gmail.com
 */

import fs from "fs";
import path from "path";
import { YOUTUBE_ITEM_TYPES, YOUTUBE_URLS } from "../../constants";
import { getJsonPathValue, jsonHasPath } from "../../utils/jjp.util";
import type { YoutubeItemType, YoutubeSearchResult } from "./types";
import { normalizeThumbnail } from "./youtube-thumbnail";

function getSeachResultItemType(item: any): YoutubeItemType {
  const typePaths = [
    {
      type: YOUTUBE_ITEM_TYPES.VIDEO,
      paths: ["$..videoRenderer", "$..compactVideoRenderer"],
    },
    {
      type: YOUTUBE_ITEM_TYPES.PLAYLIST,
      paths: ["$..playlistRenderer", "$..compactPlaylistRenderer"],
    },
    {
      type: YOUTUBE_ITEM_TYPES.CHANNEL,
      paths: ["$..channelRenderer", "$..compactChannelRenderer"],
    },
    { type: YOUTUBE_ITEM_TYPES.SHORT, paths: ["$..shortsLockupViewModel"] },
  ];

  for (const { type, paths } of typePaths) {
    if (paths.some((path) => jsonHasPath(item, path))) {
      return type;
    }
  }
  return YOUTUBE_ITEM_TYPES.UNKNOWN;
}

export function parseSearchResultItemTitle(item: any): string {
  const title =
    getJsonPathValue<string[]>(item, "$..title..text")?.[0] ||
    getJsonPathValue<string[]>(item, "$..title..simpleText")?.[0] ||
    getJsonPathValue<string[]>(
      item,
      "$..overlayMetadata..primaryText..content"
    )?.[0] ||
    getJsonPathValue<string[]>(item, "$..accessibilityText")?.[0];

  return title || "";
}

function parseSearchResultItemDescription(item: any): string | undefined {
  const description =
    getJsonPathValue<string[]>(
      item,
      "$..detailedMetadataSnippets..snippetText..text"
    )?.[0] ||
    getJsonPathValue<string[]>(item, "$..description..text")?.[0] ||
    getJsonPathValue<string[]>(item, "$..descriptionSnippet..text")?.[0];

  return description;
}

function parseSearchResultItemAgoText(item: any): string | undefined {
  const agoText =
    getJsonPathValue<string[]>(item, "$..publishedTimeText..text")?.[0] ||
    getJsonPathValue<string[]>(item, "$..publishedTimeText..simpleText")?.[0];

  return agoText;
}

function parseSearchResultItemViewCount(item: any) {
  const viewCountText =
    getJsonPathValue<string[]>(item, "$..viewCountText..text")?.[0] || // video
    getJsonPathValue<string[]>(item, "$..viewCountText..simpleText")?.[0] || // video
    getJsonPathValue<string[]>(
      item,
      "$..overlayMetadata..secondaryText..content"
    )?.[0]; // shorts

  /**
   * TODO: parse view count text to number
   * TODO: convert to normal number from formated number like 10M, 10K
   */
  return viewCountText;
}

function parseSearchResultItemUrl(id: string, type: YoutubeItemType): string {
  const baseUrl = YOUTUBE_URLS.HOME_PAGE;

  switch (type) {
    case YOUTUBE_ITEM_TYPES.SHORT:
      return `${baseUrl}/shorts/${id}`;
    case YOUTUBE_ITEM_TYPES.VIDEO:
      return `${baseUrl}/watch?v=${id}`;
    case YOUTUBE_ITEM_TYPES.PLAYLIST:
      return `${baseUrl}/playlist?list=${id}`;
    case YOUTUBE_ITEM_TYPES.CHANNEL:
      return `${baseUrl}/channel/${id}`;
    default:
      return baseUrl;
  }
}

function parseSearchResultItemCreator(item: any): {
  creatorName?: string;
  creatorUrl?: string;
} {
  const creatorName =
    getJsonPathValue<string[]>(item, "$..shortBylineText..text")?.[0] ||
    getJsonPathValue<string[]>(item, "$..longBylineText..text")?.[0] ||
    getJsonPathValue<string[]>(item, "$..shortBylineText..simpleText")?.[0] ||
    getJsonPathValue<string[]>(item, "$..longBylineText..simpleText")?.[0];

  const creatorUrl =
    getJsonPathValue<string[]>(item, "$..shortBylineText..url")?.[0] ||
    getJsonPathValue<string[]>(item, "$..longBylineText..url")?.[0];

  return {
    creatorName,
    creatorUrl: creatorUrl ? YOUTUBE_URLS.HOME_PAGE + creatorUrl : undefined,
  };
}

function parseCommonSearchResultItem(item: any): YoutubeSearchResult {
  const type = getSeachResultItemType(item);
  const id = getJsonPathValue<string>(
    item,
    `$..${
      type === YOUTUBE_ITEM_TYPES.PLAYLIST
        ? "playlistId"
        : type === YOUTUBE_ITEM_TYPES.CHANNEL
        ? "channelId"
        : "videoId"
    }`
  )?.[0];

  if (!id) throw new Error("Failed to parse item id.");

  const creator = parseSearchResultItemCreator(item);
  const description = parseSearchResultItemDescription(item);

  const title = parseSearchResultItemTitle(item);
  const ago = parseSearchResultItemAgoText(item);
  const views = parseSearchResultItemViewCount(item);
  const url = parseSearchResultItemUrl(id, type);

  const thumbnail = normalizeThumbnail(
    getJsonPathValue(item, "$..thumbnail..url") ||
      getJsonPathValue(item, "$..thumbnails..url") ||
      getJsonPathValue(item, "$..thumbnails")
  );

  const info: YoutubeSearchResult = {
    id,
    videoId:
      type === YOUTUBE_ITEM_TYPES.VIDEO || type === YOUTUBE_ITEM_TYPES.SHORT
        ? id
        : undefined,
    title,
    url,
    type,
    thumbnail,
    ...(type === YOUTUBE_ITEM_TYPES.PLAYLIST && { playlistId: id }),
    ...(type === YOUTUBE_ITEM_TYPES.CHANNEL && { channelId: id }),
    ...(creator.creatorName && { creatorName: creator.creatorName }),
    ...(creator.creatorUrl && { creatorUrl: creator.creatorUrl }),
    ...(description && { description }),
    ...(ago && { ago }),
    ...(views && { views }),
  };

  return info;
}

export function parseSearchResultItem(
  item: any,
  type?: YoutubeItemType
): YoutubeSearchResult[] | YoutubeSearchResult | undefined {
  if (type === "short") {
    const shorts = getJsonPathValue<any[]>(item, "$..reelShelfRenderer..items");
    if (shorts?.length) {
      return shorts[0]
        .map((short: any) => parseSearchResultItem(short))
        .filter(Boolean) as YoutubeSearchResult[];
    }
  }

  const itemType = getSeachResultItemType(item);

  if (type && itemType !== type) return;

  const parsedItem = parseCommonSearchResultItem(item);

  return parsedItem;
}

async function __tests__() {
  const items = JSON.parse(
    fs.readFileSync(path.join(__dirname, "searchResults.json"), "utf-8")
  );

  const allItems = [];

  for (const item of items) {
    const result = parseSearchResultItem(item);

    if (!result) continue;

    if (Array.isArray(result)) {
      allItems.push(...result);
    } else {
      allItems.push(result);
    }
  }

  console.log(allItems);
}
