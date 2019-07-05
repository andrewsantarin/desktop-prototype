import { LayoutBase } from 'rc-dock';


/**
 * Built-in `rc-dock` prefix for box & panel layout nodes.
 */
export const LAYOUT_ID_PREFIX = '+';

/**
 * Default `dock-layout-manager` prefix for tab layout nodes.
 */
export const LAYOUT_TAB_DATA_SCHEMA_ID_PREFIX = '#';

export const DEFAULT_LAYOUT: Readonly<LayoutBase> = Object.freeze({
  "dockbox": {
    "id": `${LAYOUT_ID_PREFIX}${1}`,
    "mode": "horizontal",
    "children": [
      {
        "id": `${LAYOUT_ID_PREFIX}${0}`,
        "tabs": [
        ],
      },
    ],
  },
  "floatbox": {
    "id": `${LAYOUT_ID_PREFIX}${2}`,
    "mode": "float",
    "children": [
    ],
  },
});
