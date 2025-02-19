import { YOUTUBE_URLS } from "../../constants";
import { requestUsingMiniget } from "../../utils/request.util";

let cver = "2.20210622.10.00";

export async function getInfoV1(videoId: string) {
  const url = new URL(YOUTUBE_URLS.VIDEO_INFO);
  url.searchParams.set("video_id", videoId);
  url.searchParams.set("c", "TVHTML5");
  url.searchParams.set("cver", `7${cver.substring(1)}`);
  url.searchParams.set("eurl", YOUTUBE_URLS.VIDEO_INFO_EURL + videoId);
  url.searchParams.set("ps", "default");
  url.searchParams.set("gl", "US");
  url.searchParams.set("hl", "en");
  url.searchParams.set("html5", "1");

  const body = await requestUsingMiniget(url.toString(), {});

  return body;
}
