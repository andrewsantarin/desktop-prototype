import { isString, isNullOrUndefined } from 'util';

import { LAYOUT_ID_PREFIX } from '../dock-layout-manager.constants';


/**
 * Creates a splitter regular expression from a set of delimiters.
 *
 * @export
 *
 * @param {...any[]} delimiters (optional) Any number of [delimiters](https://www.computerhope.com/jargon/d/delimite.htm)
 * (a.k.a. separators)
 *
 * **Example:**
 *
 * `"COMPONENT#1"`
 * - delimiter = `"#"`
 * - index = `1`
 *
 * `"+100"`
 * - delimiter = `"+"`
 * - index = `100`
 *
 * @returns {RegExp} A splitter regular expression which returns a match for any of the provided `delimiters`.
 */
export const createDelimitersSplitter = function createDelimitersSplitter(...delimiters: any[]): RegExp {
  const subpattern = !!Array.isArray(delimiters)
    ? delimiters
      .filter(delimiter => !isNullOrUndefined(delimiter) && delimiter !== '?')
      .map(delimiter => isString(delimiter) ? delimiter : JSON.stringify(delimiter))
      .join('|')
    : '';
  const pattern = `(?:\\${subpattern})`;

  return new RegExp(pattern);
}

/**
 * Splits a given box identification at its delimiter.
 *
 * @export
 *
 * @param {string} [id=''] (optional) A box identifier. If omitted, the function generates an empty string.
 * @param {...any[]} delimiters (optional) Any number of [delimiters](https://www.computerhope.com/jargon/d/delimite.htm)
 * (a.k.a. separators) where the `index` number of an `id` string is the last fragment,
 * c.f. [`createDelimitersSplitter`](#createDelimitersSplitter).
 *
 * @returns {string[]} A pair of substring fragments from the split `id`.
 */
export const splitLayoutId = function splitLayoutId(
  id: string = '',
  ...delimiters: any[]
): string[] {
  // Always include the 'rc-dock' prefix because we have no control over that.
  const fragments = id.split(createDelimitersSplitter(LAYOUT_ID_PREFIX, ...delimiters));

  return fragments;
}

/**
 * Extracts the index number from a given box identification.
 *
 * @export
 *
 * @param {string} [id=''] (optional) A box identifier. If omitted, the function generates an empty string.
 * @param {...any[]} delimiters (optional) Any number of [delimiters](https://www.computerhope.com/jargon/d/delimite.htm)
 * (a.k.a. separators) where the `index` number of an `id` string is the last fragment,
 * c.f. [`createDelimitersSplitter`](#createDelimitersSplitter).
 *
 * @returns The box identification's index number.
 */
export const selectIndexFromId = function selectIndexFromId(
  id: string = '',
  ...delimiters: any[]
) {
  // Always include the 'rc-dock' prefix because we have no control over that.
  const fragments = splitLayoutId(id, ...delimiters);
  const indexFragment = fragments[fragments.length - 1];

  return Number(indexFragment) || 0;
}
