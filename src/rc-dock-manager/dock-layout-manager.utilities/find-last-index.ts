import { BoxBase, PanelBase, LayoutBase } from 'rc-dock';

import { selectIndexFromId } from './select-index-from-id';


/**
 * (recursive) Accumulates all known index numbers in the given layout box base.
 *
 * @export
 *
 * @param {(BoxBase | PanelBase)} boxOrPanel The box or panel base
 * @param {...any[]} delimiters (optional) Any number of [delimiters](https://www.computerhope.com/jargon/d/delimite.htm)
 * (a.k.a. separators) where the `index` number of an `id` string is the last fragment,
 * c.f. [`createDelimitersSplitter`](#createDelimitersSplitter).
 *
 * @returns {number[]} An array of known index numbers
 */
export const accumulateIndexes = function accumulateIndexes(boxOrPanel: BoxBase | PanelBase, ...delimiters: any[]): number[] {
  const tabIndexes = ('tabs' in boxOrPanel) ? boxOrPanel.tabs.map((tab) => selectIndexFromId(tab.id, ...delimiters)) : [];
  const boxIndexes = ('children' in boxOrPanel) ? boxOrPanel.children.reduce<number[]>((ids, child) => {
    Array.prototype.push.apply(ids, accumulateIndexes(child, ...delimiters));
    return ids;
  }, []) : [];

  const indexes = [
    selectIndexFromId(boxOrPanel.id, ...delimiters)
  ];
  Array.prototype.push.apply(indexes, tabIndexes);
  Array.prototype.push.apply(indexes, boxIndexes);

  return indexes;
}

/**
 * Locates the largest the box or panel `id` number in the entire layout.
 *
 * @export
 *
 * @param {LayoutBase} layout The dock base layout
 * @param {...any[]} delimiters (optional) Any number of [delimiters](https://www.computerhope.com/jargon/d/delimite.htm)
 * (a.k.a. separators) where the `index` number of an `id` string is the last fragment,
 * c.f. [`createDelimitersSplitter`](#createDelimitersSplitter).
 *
 * @returns {number} The largest the box or panel `id` number
 */
export const findLastIndex = function findLastIndex(layout: LayoutBase, ...delimiters: any[]): number {
  const indexes = accumulateIndexes(layout.dockbox, ...delimiters);
  Array.prototype.push.apply(indexes, layout.floatbox ? accumulateIndexes(layout.floatbox, ...delimiters) : []);
  const lastIndex = Math.max(...indexes);

  return lastIndex;
}
