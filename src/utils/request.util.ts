/**
 * @module yt-lib
 * @description This module contains utility functions for making http requests
 * @author Pran pegu
 * @email pranpegu997@gmail.com
 */

//@ts-ignore
import dasu from "dasu";
//TODO: add dasu d.ts file

export function requestUsingDasu(params: any): Promise<string> {
  return new Promise((resolve, reject) => {
    dasu.req(params, (err: any, res: any, data: any) => {
      if (err) {
        reject(err);
      } else if (res.statusCode !== 200) {
        reject(
          new Error(`Failed to fetch data. Status code: ${res.statusCode}`)
        );
      } else {
        resolve(data);
      }
    });
  });
}
