## Overview

`yt-lib` is a free-to-use Node.js library that provides functionalities for searching and downloading YouTube videos. It simplifies the process of integrating YouTube search and download features into your applications.

## Inspired From

This project is inspired by `yt-search` library and ytdl-core

## Features

- **YouTube Search**: Search for YouTube videos, channels, and shorts with ease.
- **YouTube Download**: Download YouTube videos without any limit.
- **Easy Integration**: Simple and straightforward API for quick integration into your projects.

To install yt-lib:

```bash
npm i yt-lib
```

To use the search functionality in a Node.js project, follow the example below:

```javascript
import { YoutubeSearch } from "yt-lib";

async function searchVideos() {
  try {
    const { results, errors } = await YoutubeSearch.search({
      query: "funny video shorts",
      type: "short", // video, channel, short
    });

    console.log(results);
  } catch (error) {
    console.error("Error searching videos:", error);
  }
}

searchVideos();
```

This example demonstrates how to use the `YoutubeSearch` class to search for YouTube videos. Make sure to install the necessary dependencies and import the `YoutubeSearch` class from the `yt-lib` module.

## Author

This library is developed & maintained by [ppegu](https://github.com/ppegu).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## Running the Project

To run this project using Bun, follow the steps below:

1. Install Bun if you haven't already:

```bash
curl -fsSL https://bun.sh/install | bash
```

2. Install the project dependencies using Bun:

```bash
bun install
```

3. Run your project:

```bash
bun run start
```

## Issues

If you encounter any issues, please report them on the [GitHub issues page](https://github.com/ppegu/yt-lib/issues).

## GitHub

The source code for this project can be found on [GitHub](https://github.com/ppegu/yt-lib).

## Donations

If you find this project helpful and would like to support its development, please consider making a donation. Donation details will be provided soon.
