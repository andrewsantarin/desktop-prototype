import { createElement, Fragment } from 'react';
import { LayoutBase, TabBase, TabData } from 'rc-dock';

import { DEFAULT_LAYOUT } from '../dock-layout-manager.constants';



/**
 * Generates a layout base object.
 *
 * @export
 *
 * @param {LayoutBase} [options] Additional layout base options
 *
 * @returns {LayoutBase} A new layout base object
 */
export const createLayoutBase = function createLayoutBase(options?: LayoutBase): LayoutBase {
  const layout: LayoutBase = Object.assign(DEFAULT_LAYOUT, options);

  return layout;
}

/**
 * Generates a tab data object.
 *
 * @export
 *
 * @param {(TabData | TabBase)} [options] Additional tab data options
 *
 * @returns A new tab data object
 */
export const createTabData = function createTabData(options?: TabData | TabBase) {
  const tabData: TabData = Object.assign(
    {
      title: '',
      content: createElement(Fragment),
    },
    options
  );

  return tabData;
}
