import React, { forwardRef, useRef, useImperativeHandle, FunctionComponent, ComponentType, ComponentPropsWithRef, useCallback } from 'react';
import { useMount } from 'react-use';
import { useAutoControlled } from 'react-auto-controlled';
import { DockLayout, LayoutBase, PanelBase, PanelData, TabData } from 'rc-dock';
import { addTabToPanel } from 'rc-dock/lib/Algorithm';
import { isNullOrUndefined } from 'util';

import { safeInvoke, safeInvokeWithRef } from 'lib';
import { DockLayoutProps, TabDataSchema } from './dock-layout-manager.types';
import { createLayoutBase, findLastIndex, findFirstDeepestPanel, findTabParentPanel } from './dock-layout-manager.utilities';
import { selectTabDataFromTabDataSchema } from './dock-layout-manager.selectors';


export interface DockLayoutManagerApi {
  addTabKeyToPanelId: (tabKey: string, panelId: string) => (string | undefined);
  addTabKeyToActivePanel: (tabKey: string) => (string | undefined);
  loadLayout: DockLayout['loadLayout'];
  saveLayout: () => (LayoutBase | undefined);
}

export interface DockLayoutManagerDefaultProps {
  /**
   * Tab identification prefix string for tab assignment purposes.
   *
   * @type {string}
   * @memberof DockLayoutManagerDefaultProps
   */
  tabIdPrefix: string;

  /**
   * Tab schema on a tab ID to tab data key-value lookup basis.
   *
   * @type {TabDataSchema}
   * @memberof DockLayoutManagerDefaultProps
   */
  tabDataSchema: TabDataSchema;
}

export interface DockLayoutManagerProps extends
  Omit<DockLayoutProps, 'onLayoutChange' | 'defaultLayout' | 'layout'>,
  Partial<DockLayoutManagerDefaultProps>
{
  // #region auto controlled props
  /**
   * Current active panel.
   *
   * @type {string}
   * @memberof DockLayoutManagerProps
   */
  activePanelId?: string;

  /**
   * Initial active panel.
   *
   * @type {string}
   * @memberof DockLayoutManagerProps
   */
  defaultActivePanelId?: string;

  /**
   * Current layout structure.
   *
   * @type {DockLayoutProps['layout']}
   * @memberof DockLayoutManagerProps
   */
  layout?: DockLayoutProps['layout'];

  /**
   * Initial layout structure.
   *
   * @type {LayoutBase}
   * @memberof DockLayoutManagerProps
   */
  defaultLayout?: LayoutBase;
  // #endregion

  // #region custom event handler methods
  /**
   * The layout change event.
   *
   * @param {LayoutBase} newLayout The next set of layout defintions after the change event.
   * @param {(string | null)} currentTabId The identifier of the tab which was affected by the change event.
   * @param {string} currentTabPanelId The identifier of the parent panel of the affected tab.
   *
   * @memberof DockLayoutManagerProps
   */
  onLayoutChange?: (newLayout: LayoutBase, currentTabId: string | null, currentTabPanelId: string) => void;

  /**
   * The layout load event.
   *
   * @param {LayoutBase} newLayout The next set of layout defintions after the change event.
   * @param {string} activePanelId The identifier of the currently active panel.
   *
   * @memberof DockLayoutManagerProps
   */
  onLayoutLoad?: (layout: LayoutBase, activePanelId: string) => void;
  // #endregion
}

export const DockLayoutManager = forwardRef<any, DockLayoutManagerProps>(function DockLayoutManager(props, ref) {
  const dockLayout = useRef<DockLayout>(null);

  const [ activePanelId, setActivePanelId ] = useAutoControlled('', {
    prop: props.activePanelId,
    defaultProp: props.defaultActivePanelId,
  });
  const [ layout, setLayout ] = useAutoControlled(createLayoutBase(), {
    prop: props.layout,
    defaultProp: props.defaultLayout,
  });

  const createTabData = (tabKey: string) => {
    const { tabIdPrefix, tabDataSchema } = props;
    const tabNextIndex = findLastIndex(layout, tabIdPrefix) + 1;
    const tabData = {
      ...selectTabDataFromTabDataSchema(tabKey, tabDataSchema),
      id: `${tabKey}${tabIdPrefix}${tabNextIndex}`,
    };

    return tabData;
  };

  const createDockLayoutProps = (dockLayout: DockLayout, props: DockLayoutManagerProps): DockLayoutProps => {
    const { loadTab, afterPanelLoaded } = props;
    const defaultLayout = dockLayout.state.layout;
    const dockLayoutProps: DockLayoutProps = {
      afterPanelLoaded: afterPanelLoaded,
      defaultLayout: defaultLayout,
      loadTab: loadTab,
    };

    return dockLayoutProps;
  };

  const addTabKeyToFirstAvailablePanel = (tabKey: string): (string | undefined) => {
    const panel = (
      findFirstDeepestPanel(layout.floatbox) ||
      findFirstDeepestPanel(layout.dockbox)
    );

    if (isNullOrUndefined(panel) || isNullOrUndefined(panel.id)) {
      return;
    }

    const { id: panelId } = panel;

    return safeInvokeWithRef(dockLayout, (dockLayout) => {
      const targetPanel = dockLayout.find(panelId) as PanelData;
      const dockLayoutProps = createDockLayoutProps(dockLayout, props);
      const currentLayout = DockLayout.loadLayoutData(layout, dockLayoutProps);
      const newTab = createTabData(tabKey);
      const newLayout = addTabToPanel(currentLayout, newTab, targetPanel);

      // Explicitly update the state of the underlying `dockLayout` to generate the `LayoutBase` format.
      // The generated result will be consumed by this manager's `handleLayoutChange` function
      dockLayout.changeLayout(newLayout, newTab.id);

      return newTab.id;
    });
  };

  const addTabKeyToPanelId: DockLayoutManagerApi['addTabKeyToPanelId'] = (tabKey, panelId) => {
    return safeInvokeWithRef(dockLayout, (dockLayout) => {
      const panelData = dockLayout.find(panelId);
      const tabData = createTabData(tabKey);

      dockLayout.dockMove(tabData, panelData, 'middle');

      return tabData.id;
    });
  };

  const addTabKeyToActivePanel: DockLayoutManagerApi['addTabKeyToActivePanel'] = (tabKey) => {
    if (activePanelId !== '') {
      return addTabKeyToPanelId(tabKey, activePanelId);
    } else {
      return addTabKeyToFirstAvailablePanel(tabKey);
    }
  };

  const loadLayout = (savedLayout: LayoutBase) => {
    safeInvokeWithRef(dockLayout, (dockLayout) => {
      dockLayout.loadLayout(savedLayout);
    });
  };

  const saveLayout = () => {
    return safeInvokeWithRef(dockLayout, (dockLayout) => {
      return dockLayout.saveLayout();
    });
  };

  const api: DockLayoutManagerApi = {
    addTabKeyToPanelId,
    addTabKeyToActivePanel,
    loadLayout,
    saveLayout,
  };

  const handleLayoutChange = useCallback(
    (newLayout: LayoutBase, currentTabId: string | null) => {
      let newActivePanelId: string;

      if (currentTabId === null) {
        // TODO: This part is highly unpredictable. I don't know why, but rc-dock generates ids which are way off.
        const { dockbox } = newLayout;
        const deepestPanel = findFirstDeepestPanel(dockbox) as PanelBase;
        newActivePanelId = deepestPanel.id as string;
      } else {
        const currentTabPanel = findTabParentPanel(newLayout, currentTabId) || {} as PanelBase;
        newActivePanelId = currentTabPanel.id || activePanelId;
      }

      setLayout(newLayout);
      setActivePanelId(newActivePanelId);

      safeInvoke(props.onLayoutChange, newLayout, currentTabId, activePanelId);
    },
    [
      setLayout,
      setActivePanelId,
      safeInvoke,
      props,
    ]
  );

  const handlePanelLoaded: DockLayoutManagerProps['afterPanelLoaded'] = undefined;
  const handlePanelSaved: DockLayoutManagerProps['afterPanelSaved'] = undefined;

  useImperativeHandle(ref, () => api);

  useMount(() => {
    safeInvoke(props.onLayoutLoad, layout, activePanelId);
  });

  // Ignore `defaultLayout`, `layout` from props.
  // Refer to the manager's internal `layout` state instead.
  // It should be able to govern itself without needing too much external control.
  const { style, groups, dropMode } = props;

  return (
    <DockLayout
      afterPanelLoaded={handlePanelLoaded}
      afterPanelSaved={handlePanelSaved}
      // loadTab={this.doLoadTab}
      // saveTab={this.doSaveTab}
      dropMode={dropMode}
      layout={layout}
      groups={groups}
      onLayoutChange={handleLayoutChange}
      ref={dockLayout}
      style={style}
    />
  );
});
