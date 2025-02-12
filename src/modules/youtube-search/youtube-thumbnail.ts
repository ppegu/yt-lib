/**
 * @module yt-lib/youtube-search
 * @description This module provides a class to search for videos on YouTube.
 * @author Pran pegu
 * @email pranpegu997@gmail.com
 */

export function findBestQualityThumbnail(
  thumbnails: string[]
): string | undefined {
  let thumbnail = thumbnails.find((t) => t.includes("oardefault"))?.[0];

  if (thumbnail) {
    return thumbnail.split("?")[0];
  }

  thumbnail = thumbnails.find((t) => t.includes("default.jpg"))?.[0];

  if (thumbnail) {
    return thumbnail.replace("default.jpg", "hqdefault.jpg").split("?")[0];
  }

  // TODO: add more quality checks

  return thumbnails[0];
}

export function normalizeThumbnail(thumbnail: string | string[] | undefined) {
  if (Array.isArray(thumbnail)) {
    return findBestQualityThumbnail(thumbnail) || thumbnail[0];
  }

  return thumbnail;
}
