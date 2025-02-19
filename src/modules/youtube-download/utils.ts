/**
 * Parses a JSON string and removes any leading characters that match the `jsonClosingChars` regex pattern.
 * If the input is already an object, it is returned as is.
 * If the input is a string, it attempts to clean and parse it into an object.
 *
 * @param varName - The name of the variable being parsed, used for error reporting.
 * @param json - The JSON string or object to be parsed and cleaned.
 * @returns The parsed JSON object, or the original object if the input was already an object.
 * @throws Will throw an error if the JSON string cannot be parsed.
 */
const parseJsonAndClean = (varName: string, json: any) => {
  const jsonClosingChars = /^[)\]}'\s]+/;

  if (!json || typeof json === "object") {
    return json;
  } else {
    try {
      json = json.replace(jsonClosingChars, "");
      return JSON.parse(json);
    } catch (err: any) {
      throw Error(`Error parsing ${varName}: ${err.message}`);
    }
  }
};

/**
 * Extracts a string from between two substrings, or regular expressions.
 *
 * @param haystack - The string to search within.
 * @param left - The left boundary to search for.
 * @param right - The right boundary to search for.
 * @returns The string found between the left and right boundaries, or an empty string if not found.
 */
const stringInbetween = (
  haystack: string,
  left: string | RegExp,
  right: string
) => {
  let pos;
  if (left instanceof RegExp) {
    const match = haystack.match(left);
    if (!match) {
      return "";
    }
    pos = (match?.index ?? -1) + (match ? match[0].length : 0);
  } else {
    pos = haystack.indexOf(left);
    if (pos === -1) {
      return "";
    }
    pos += left.length;
  }
  haystack = haystack.slice(pos);
  pos = haystack.indexOf(right);
  if (pos === -1) {
    return "";
  }
  haystack = haystack.slice(0, pos);
  return haystack;
};

const ESCAPING_SEQUENCES = [
  { start: '"', end: '"' },
  { start: "'", end: "'" },
  { start: "`", end: "`" },
  { start: "/", end: "/", startPrefix: /\/\// },
  { start: "/", end: "/", startPrefix: /\/\*/ },
];
/**
 * Matches the beginning and end braces of input JS, returning only the JS content.
 *
 * @param mixedJson - The mixed JSON string to be processed.
 * @returns The extracted JSON string.
 * @throws Will throw an error if the JSON string is not properly formatted.
 */
const extractJsonContent = (mixedJson: string): string => {
  // Define the general open and closing tag
  let open: string | undefined;
  let close: string | undefined;

  if (mixedJson[0] === "[") {
    open = "[";
    close = "]";
  } else if (mixedJson[0] === "{") {
    open = "{";
    close = "}";
  }

  if (!open || !close) {
    throw new Error(
      `Can't extract unsupported JSON (need to begin with [ or { ) but got: ${mixedJson[0]}`
    );
  }

  // States if the loop is currently inside an escaped js object
  let isEscapedObject: {
    start: string;
    end: string;
    startPrefix?: RegExp;
  } | null = null;

  // States if the current character is treated as escaped or not
  let isEscaped = false;

  // Current open brackets to be closed
  let counter = 0;

  // Go through all characters from the start
  for (let i = 0; i < mixedJson.length; i++) {
    // End of current escaped object
    if (
      !isEscaped &&
      isEscapedObject !== null &&
      mixedJson[i] === isEscapedObject.end
    ) {
      isEscapedObject = null;
      continue;
    }

    // Might be the start of a new escaped object
    if (!isEscaped && isEscapedObject === null) {
      for (const escaped of ESCAPING_SEQUENCES) {
        if (mixedJson[i] !== escaped.start) continue;

        // Test startPrefix against last 10 characters
        if (
          !escaped.startPrefix ||
          mixedJson.substring(i - 10, i).match(escaped.startPrefix)
        ) {
          isEscapedObject = escaped;
          break;
        }
      }

      // Continue if we found a new escaped object
      if (isEscapedObject !== null) {
        continue;
      }
    }

    // Toggle the isEscaped boolean for every backslash
    // Reset for every regular character
    isEscaped = mixedJson[i] === "\\" && !isEscaped;

    if (isEscapedObject !== null) continue;

    if (mixedJson[i] === open) {
      counter++;
    } else if (mixedJson[i] === close) {
      counter--;
    }

    // All brackets have been closed, thus end of JSON is reached
    if (counter === 0) {
      // Return the extracted JSON
      return mixedJson.substring(0, i + 1);
    }
  }

  // We ran through the whole string and ended up with an unclosed bracket
  throw new Error(
    "Can't extract unsupported JSON (no matching closing bracket found)"
  );
};

/**
 * Finds and parses JSON content within a string, between specified left and right boundaries.
 *
 * @param varName - The name of the variable being parsed, used for error reporting.
 * @param body - The string to search within.
 * @param left - (RegExp) The left boundary to search for.
 * @param right - The right boundary to search for.
 * @param prependJSON - A string to prepend to the found JSON content before parsing.
 * @returns The parsed JSON object.
 * @throws Will throw an error if the JSON content cannot be found or parsed.
 */
const findAndParseJson = (
  varName: string,
  body: string,
  left: RegExp,
  right: string,
  prependJSON: string
) => {
  // Extract the JSON string between the left and right boundaries
  let jsonStr = stringInbetween(body, left, right);

  // Throw an error if the JSON string cannot be found
  if (!jsonStr) {
    throw Error(`Could not find ${varName} in the html`);
  }

  // Prepend any additional JSON content and parse the final JSON string
  return parseJsonAndClean(
    varName,
    extractJsonContent(`${prependJSON}${jsonStr}`)
  );
};

function getYoutubeHTML5PlayerJS(bodyText: string) {
  let html5playerRes =
    /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/.exec(
      bodyText
    );
  return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
}

export default {
  findAndParseJson,
  parseJsonAndClean,
  stringInbetween,
  extractJsonContent,
  getYoutubeHTML5PlayerJS,
};
