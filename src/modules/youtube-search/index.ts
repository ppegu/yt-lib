/**
 * @module yt-lib/youtube-search
 * @description This module provides a class to search for videos on YouTube.
 * @author Pran pegu
 * @email pranpegu997@gmail.com
 */

import * as cheerio from "cheerio";
import { JSONPath } from "jsonpath-plus";
import url from "url";
import { DEFAULT_HEADERS, YOUTUBE_URLS } from "../../constants";
import Logger from "../../utils/Logger";
import { requestUsingDasu } from "../../utils/request.util";
import { parseSearchResultItem } from "./parseSearchResultItem";
import type {
  YoutubeItemType,
  YoutubeSearchOptions,
  YoutubeSearchResult,
} from "./types";

const logger = Logger.createLogger("YoutubeSearch");

const defaultSearchOptions: YoutubeSearchOptions = {
  query: "",
  limit: 20,
  type: "short",
  device: "desktop",
};

export default class YoutubeSearch {
  private static _parseSearchInitialData(htmlText: string) {
    try {
      const $ = cheerio.load(htmlText);

      const re = /{.*}/;

      let initialData: RegExpExecArray =
        re.exec($("div#initial-data").html() || "") ||
        ([] as unknown as RegExpExecArray);

      if (!initialData.length) {
        const scripts = $("script");

        for (const script of scripts) {
          const scriptContent = $(script).html() || "";

          const lines = scriptContent.split("\n");

          lines.forEach(function (line) {
            let i;
            while ((i = line.indexOf("ytInitialData")) !== -1) {
              line = line.slice(i + "ytInitialData".length);
              const match = re.exec(line);
              if (match && match.length > initialData.length) {
                initialData = match;
              }
            }
          });
        }
      }
      if (!initialData) {
        logger.warn("Failed to extract initial data from the html document.");
        throw new Error(
          "Failed to extract initial data from the html document."
        );
      }

      const json = JSON.parse(initialData[0]);
      return json;
    } catch (error) {
      logger.error("Error parsing search results:", error);
      throw new Error("Error parsing search results.");
    }
  }

  private static _parseSearchResults(htmlText: string, type?: YoutubeItemType) {
    logger.info("Parsing search results...");
    const initialDataJson = this._parseSearchInitialData(htmlText);

    // TODO: items exists duplicate items. need to find a way to filter or only get unique items
    const items = [
      ...JSONPath({
        json: initialDataJson,
        path: "$..itemSectionRenderer..contents.*",
        resultType: "value",
      }),
      // support newer richGridRenderer html structure
      ...JSONPath({
        json: initialDataJson,
        path: "$..primaryContents..contents.*",
        resultType: "value",
      }),
    ];

    logger.info("items.length:", items.length);

    const results: YoutubeSearchResult[] = [];

    const errors: any[] = [];

    for (const item of items) {
      try {
        const parsedResult = parseSearchResultItem(item, type);
        if (Array.isArray(parsedResult)) {
          parsedResult.forEach((result) => {
            if (
              !results.some((existingResult) => existingResult.id === result.id)
            ) {
              results.push(result);
            }
          });
        } else if (
          parsedResult &&
          !results.some(
            (existingResult) => existingResult.id === parsedResult.id
          )
        ) {
          results.push(parsedResult);
        }
      } catch (error) {
        errors.push(error);
      }
    }

    return { results, errors };
  }

  static async search(options: YoutubeSearchOptions = defaultSearchOptions) {
    logger.info(`Searching for ${options}`);

    const headers = {
      ...DEFAULT_HEADERS,
    };

    let searchUrl =
      options.device === "mobile"
        ? YOUTUBE_URLS.SEARCH_QUERY_MOBILE
        : YOUTUBE_URLS.SEARCH_QUERY_DESKTOP;

    searchUrl += options.query;

    searchUrl += `&hl=en&gl=US`;

    const parsedUrl = url.parse(searchUrl);
    if (!parsedUrl) {
      throw new Error("Failed to parse search URL");
    }
    searchUrl = parsedUrl.href;

    const htmlText = await requestUsingDasu({ ...parsedUrl, headers });

    const searchResults = this._parseSearchResults(htmlText, options.type);

    return searchResults;
  }
}

/**
 *
 *
 *
 * Tests
 *
 *
 *
 *
 */

async function __tests__() {
  const { results } = await YoutubeSearch.search({
    query: "funny video shorts",
    type: "short",
  });

  console.log(results[1]);
}
