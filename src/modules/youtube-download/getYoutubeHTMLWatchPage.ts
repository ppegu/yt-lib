import { YOUTUBE_URLS } from "../../constants";
import { requestUsingMiniget } from "../../utils/request.util";
import utils from "./utils";

export function findPlayerResponse(info: any) {
  const player_response =
    info &&
    ((info.args && info.args.player_response) ||
      info.player_response ||
      info.playerResponse ||
      info.embedded_player_response);
  return utils.parseJsonAndClean("player_response", player_response);
}

export type GetHTMLWatchPageOptions = {
  hl?: string;
  requestOptions?: any;
};

const getHTMLWatchPageDefaultOptions: GetHTMLWatchPageOptions = {
  hl: "en",
  requestOptions: {},
};

export async function getYoutubeHTMLWatchPage(
  videoId: string,
  options: GetHTMLWatchPageOptions = getHTMLWatchPageDefaultOptions
) {
  const url = `${YOUTUBE_URLS.WATCH_PAGE}?v=${videoId}&hl=${options.hl}`;

  const bodyText = await requestUsingMiniget(url, {
    ...options.requestOptions,
  });

  const info: any = {};

  try {
    info.cver = utils.stringInbetween(
      bodyText,
      '{"key":"cver","value":"',
      '"}'
    );

    info.player_response = utils.findAndParseJson(
      "player_response",
      bodyText,
      /\bytInitialPlayerResponse\s*=\s*\{/i,
      "</script>",
      "{"
    );
  } catch (_err) {
    const args = utils.findAndParseJson(
      "player_response",
      bodyText,
      /\bytplayer\.config\s*=\s*{/,
      "</script>",
      "{"
    );
    info.player_response = findPlayerResponse(args);
  }

  info.html5player = utils.getYoutubeHTML5PlayerJS(bodyText);

  return info;
}
