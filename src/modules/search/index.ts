import * as cheerio from "cheerio";
import url from "url";
import { DEFAULT_HEADERS, YOUTUBE_URLS } from "../../constants";
import Logger from "../../utils/Logger";
import { requestUsingDasu } from "../../utils/request.util";
import type { YoutubeSearchOptions } from "./types";
import { JSONPath } from "jsonpath-plus";
import fs from "fs";
import path from "path";

const logger = Logger.createLogger("YoutubeSearch");

const defaultSearchOptions: YoutubeSearchOptions = {
  query: "",
  limit: 20,
  type: "video",
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

  private static _parseSearchResults(htmlText: string) {
    logger.info("Parsing search results...");
    const initialData = this._parseSearchInitialData(htmlText);

    const items = [
      JSONPath({
        json: initialData,
        path: "$..itemSectionRenderer..contents.*",
        resultType: "value",
      }),
      // support newer richGridRenderer html structure
      ...JSONPath({
        json: initialData,
        path: "$..primaryContents..contents.*",
        resultType: "value",
      }),
    ];

    logger.info("items.length:", items.length);

    for (const item of items) {
      fs.writeFileSync(
        path.join(__dirname, "searchResults.json"),
        JSON.stringify(item, null, 2)
      );
      break;
    }
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

    // const { status, data: html } = await axios({
    //   method: "GET",
    //   url: searchUrl,
    //   headers,
    // });

    const htmlText = await requestUsingDasu({ ...parsedUrl, headers });

    const searchResults = this._parseSearchResults(htmlText);
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
  await YoutubeSearch.search({
    query: "funny video shorts",
  });
}

__tests__();
