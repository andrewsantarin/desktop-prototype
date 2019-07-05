import { BoxBase, LayoutBase } from 'rc-dock';


/**
 * (recursive) Accumulates the number of active tab ids in the entire layout box.
 *
 * @export
 *
 * @param {BoxBase} box The layout box to search in
 *
 * @returns {string[]}
 */
export const getActiveIdsInBox = function getActiveIdsInBox(box: BoxBase): string[] {
  let activeIds: string[] = [];
  for (let child of box.children) {
    if ('children' in child) {
      Array.prototype.push.apply(activeIds, getActiveIdsInBox(child));
    } else if ('tabs' in child) {
      if (child.activeId) {
        activeIds.push(child.activeId);
      }
    }
  }
  return activeIds;
}

/**
 * Accumulates the number of active tab ids in the entire layout tree.
 *
 * @export
 *
 * @param {LayoutBase} layout The dock & float component hierarchy
 *
 * @returns {string[]}
 */
export const getActiveIds = function getActiveIds(layout: LayoutBase): string[] {
  let activeIds = getActiveIdsInBox(layout.dockbox);
  if (!!layout.floatbox) {
    Array.prototype.push.apply(activeIds, getActiveIdsInBox(layout.floatbox));
  }
  return activeIds;
}
