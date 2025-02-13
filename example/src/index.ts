import { YoutubeSearch } from "yt-lib";

YoutubeSearch.search({
  query: "Funny shorts",
  type: "short",
  device: "desktop",
}).then(({ results, errors }) => {
  if (errors) {
    console.log("Errors: ", errors);
    return;
  }

  console.log("Found " + results.length + " videos");
});
