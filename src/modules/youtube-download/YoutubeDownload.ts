import Logger from "../../utils/Logger";
import { getYoutubeHTMLWatchPage } from "./getYoutubeHTMLWatchPage";
import { getYoutubeVideoMedia } from "./getYoutubeVideoMedia";

const logger = Logger.createLogger("YoutubeDownload");

export default class YoutubeDownload {
  static async parseFormats(player_response: any) {
    let formats: any[] = [];
    if (player_response && player_response.streamingData) {
      formats = formats
        .concat(player_response.streamingData.formats || [])
        .concat(player_response.streamingData.adaptiveFormats || []);
    }
    return formats;
  }

  static async fetchInfo(videoId: string) {
    const info = await getYoutubeHTMLWatchPage(videoId);

    if (!info) {
      throw new Error(`Failed to download video with id: ${videoId}`);
    }

    Object.assign(info, {
      format: this.parseFormats(info?.player_response),
    });

    const media = getYoutubeVideoMedia(info);

    return info;
  }

  static async download(videoId: string) {
    logger.info(`Downloading video with id: ${videoId}`);

    await this.fetchInfo(videoId);

    logger.info(`Video with id: ${videoId} downloaded`);
  }
}

/**
 *
 *
 * TESTS
 *
 *
 */

async function __tests__() {
  const info = await YoutubeDownload.fetchInfo("AQSPgfT9-uw");

  console.log(info);
}

__tests__();
