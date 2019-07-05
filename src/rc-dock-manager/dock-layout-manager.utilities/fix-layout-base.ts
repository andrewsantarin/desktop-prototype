import { BoxBase, PanelBase, LayoutBase, TabBase } from 'rc-dock';

import { LAYOUT_ID_PREFIX } from '../dock-layout-manager.constants';


type FixNode = <LayoutNode extends (PanelBase | BoxBase | TabBase)>(node: LayoutNode) => LayoutNode
type FixNodeIdReference = {
  /**
   * A reference to the last known sequence number.
   * 
   * This value will increment if it's applied to a node's `.id` attribute so that the next node will also receive its own unique `.id`.
   *
   * @type {number}
   */
  lastIndex: number;
}

/**
 * Generates an `id` string from an `index` number.
 *
 * @export
 *
 * @param {number} index A sequence number
 *
 * @returns An element identifier
 */
export const toLayoutId = function toLayoutId(index: number) {
  return `${LAYOUT_ID_PREFIX}${index}`;
}

/**
 * Patches the layout node with a proper `.id` attribute.
 *
 * @export
 *
 * @template LayoutNodeBase
 * @template Reference
 *
 * @param {LayoutNodeBase} node Object to enhance
 * @param {Reference} [reference=({
 *   index: 0,
 * } as Reference)] Additional calculation details
 *
 * @returns {LayoutNodeBase} A new layout node object patched with an `.id` attribute
 *
 * @see https://github.com/ticlo/rc-dock/blob/f05bcec15be3df2b457916625d91f6f4e36b2f13/src/Algorithm.ts#L349-L364 — Reference
 */
export const fixLayoutNodeBaseId = function fixLayoutNodeBaseId<
  LayoutNodeBase extends (PanelBase | BoxBase | TabBase),
  Reference extends FixNodeIdReference
>(
  node: LayoutNodeBase,
  reference: Reference = ({
    lastIndex: 0,
  } as Reference)
): LayoutNodeBase {
  const newNode: LayoutNodeBase = Object.assign(
    {
      id: undefined, // Placeholder this so that JSON.stringify() always prints this attribute ahead of all others.
    },
    node,
  );

  if (!newNode.id) {
    newNode.id = toLayoutId(reference.lastIndex);
    reference.lastIndex++;
  } else if (newNode.id.startsWith('+')) {
    let index = Number(newNode.id);
    if (index > reference.lastIndex) {
      reference.lastIndex = index;
    }
  }

  return newNode;
}

/**
 * Patches the layout container base and its children with proper attributes such as ids.
 *
 * @export
 *
 * @template LayoutContainerNode — A `PanelBase` or `BoxBase` node
 *
 * @param {LayoutContainerNode} node
 * A node containing `.tabs` (like panels) or `.children` (like layout dockbox, floatbox, or nested boxes)
 * @param {(<LayoutNode extends (PanelBase | BoxBase | TabBase) >(node: LayoutNode) => LayoutNode)} fixNode 
 * A patcher that determines the node attributes to enhance
 *
 * @returns {LayoutContainerNode} A new node containing attributes as enhanced by `fixNode`
 *
 * @see https://github.com/ticlo/rc-dock/blob/f05bcec15be3df2b457916625d91f6f4e36b2f13/src/Algorithm.ts#L401-L473 — Reference
 */
export const fixLayoutContainerNodeBase = function fixLayoutContainerNodeBase<
  LayoutContainerNode extends (PanelBase | BoxBase)
>(
  node: LayoutContainerNode,
  fixNode: FixNode
): LayoutContainerNode {
  let newNode: LayoutContainerNode = fixNode(Object.assign({}, node));

  if ('children' in newNode) {
    const children = (newNode as BoxBase).children.map((child) => fixLayoutContainerNodeBase(child, fixNode));
    (newNode as BoxBase).children = children;
  } else if ('tabs' in node) {
    const tabs = (newNode as PanelBase).tabs.map(fixNode);
    (newNode as PanelBase).tabs = tabs;
  }

  return newNode;
}

/**
 * Patches the layout base with proper attributes such as ids.
 *
 * @export
 *
 * @param {LayoutBase} layout The unpatched layout base
 * @param {number} [lastIndex=0] (optional) The greatest value layout node sequence number for this layout, if known.
 * If omitted, a value of `0` is automatically assigned.
 *
 * @returns {LayoutBase} The new patched layout base object
 *
 * @see https://github.com/ticlo/rc-dock/blob/f05bcec15be3df2b457916625d91f6f4e36b2f13/src/Algorithm.ts#L347-L503 — Reference
 */
export const fixLayoutBase = function fixLayoutBase(layout: LayoutBase, lastIndex: number = 0): LayoutBase {
  // NOTE:
  // The source material scopes its underlying fix* methods in itself, so it is considered a monolith.
  // This derivative function's underlying methods have been extracted in favor of finer unit testing with smaller function chunks.
  // The end result is this approach. The last index, unlike the source material, is no longer global and thus, is predictable.
  // A curried function and a mutable object pointing to the last index is used to work around the "global scope" problem.
  const fixNodeReference: FixNodeIdReference = {
    lastIndex: lastIndex,
  };
  const fixNode: FixNode = (node) => fixLayoutNodeBaseId(node, fixNodeReference);

  let newLayout: LayoutBase = {
    dockbox: fixLayoutContainerNodeBase(layout.dockbox, fixNode),
  };

  if (layout.floatbox) {
    newLayout.floatbox = fixLayoutContainerNodeBase(layout.floatbox, fixNode);
  }

  return newLayout;
}
