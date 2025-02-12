/**
 * @module yt-lib
 * @description JSONPath utility functions
 * @author Pran pegu
 * @email pranpegu997@gmail.com
 */
import { JSONPath } from "jsonpath-plus";

export function getJsonPathValue<T = any | undefined>(
  json: any,
  path: string
): T | undefined {
  return JSONPath({
    json,
    path: path,
    resultType: "value",
  }) as undefined | T;
}

export function jsonHasPath(json: any, path: string): boolean {
  const value = getJsonPathValue(json, path);

  if (Array.isArray(value)) {
    return !!value.length;
  }

  return value !== undefined;
}
