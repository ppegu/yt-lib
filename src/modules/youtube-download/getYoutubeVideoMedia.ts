import { URL } from "url";
import { YOUTUBE_URLS } from "../../constants";

const TITLE_TO_CATEGORY: { [key: string]: { name: string; url: string } } = {
  // Define your TITLE_TO_CATEGORY mapping here
};

function getText(obj: any): string {
  // Implement the getText function based on your requirements
  return obj.simpleText || obj.runs.map((run: any) => run.text).join("");
}

export function getYoutubeVideoMedia(info: any): { [key: string]: any } {
  let media: { [key: string]: any } = {};
  let results: any[] = [];
  try {
    results =
      info.response.contents.twoColumnWatchNextResults.results.results.contents;
  } catch (err) {
    // Do nothing
  }

  let result = results.find((v) => v.videoSecondaryInfoRenderer);
  if (!result) {
    return {};
  }

  try {
    let metadataRows = (
      result.metadataRowContainer ||
      result.videoSecondaryInfoRenderer.metadataRowContainer
    ).metadataRowContainerRenderer.rows;
    for (let row of metadataRows) {
      if (row.metadataRowRenderer) {
        let title = getText(row.metadataRowRenderer.title).toLowerCase();
        let contents = row.metadataRowRenderer.contents[0];
        media[title] = getText(contents);
        let runs = contents.runs;
        if (runs && runs[0].navigationEndpoint) {
          media[`${title}_url`] = new URL(
            runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
            YOUTUBE_URLS.HOME_PAGE
          ).toString();
        }
        if (title in TITLE_TO_CATEGORY) {
          media.category = TITLE_TO_CATEGORY[title].name;
          media.category_url = TITLE_TO_CATEGORY[title].url;
        }
      } else if (row.richMetadataRowRenderer) {
        let contents: any[] = row.richMetadataRowRenderer.contents;
        let boxArt = contents.filter(
          (meta) =>
            meta.richMetadataRenderer.style ===
            "RICH_METADATA_RENDERER_STYLE_BOX_ART"
        );
        for (let { richMetadataRenderer } of boxArt) {
          let meta = richMetadataRenderer;
          media.year = getText(meta.subtitle);
          let type = getText(meta.callToAction).split(" ")[1];
          media[type] = getText(meta.title);
          media[`${type}_url`] = new URL(
            meta.endpoint.commandMetadata.webCommandMetadata.url,
            YOUTUBE_URLS.HOME_PAGE
          ).toString();
          media.thumbnails = meta.thumbnail.thumbnails;
        }
        let topic = contents.filter(
          (meta) =>
            meta.richMetadataRenderer.style ===
            "RICH_METADATA_RENDERER_STYLE_TOPIC"
        );
        for (let { richMetadataRenderer } of topic) {
          let meta = richMetadataRenderer;
          media.category = getText(meta.title);
          media.category_url = new URL(
            meta.endpoint.commandMetadata.webCommandMetadata.url,
            YOUTUBE_URLS.HOME_PAGE
          ).toString();
        }
      }
    }
  } catch (err) {
    // Do nothing.
  }

  return media;
}
