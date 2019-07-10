import React, { createRef, Component, Fragment } from 'react';
import { AutoControlledManager, AutoControlled } from 'react-auto-controlled';
import NewWindow, { IWindowFeatures } from 'react-new-window';
import { DockLayout, LayoutBase, PanelBase, PanelData, TabBase, TabData } from 'rc-dock';
import { addTabToPanel } from 'rc-dock/lib/Algorithm';
import { memorize } from 'memorize-decorator';
import { isNullOrUndefined } from 'util';

import 'rc-dock/dist/rc-dock.css';
import './DockLayoutManager.css';

import { safeInvoke, safeInvokeWithRef } from 'lib';

import { LAYOUT_TAB_DATA_SCHEMA_ID_PREFIX } from './dock-layout-manager.constants';
import { DockLayoutProps, TabDataSchema, DetachedWindowLayout } from './dock-layout-manager.types';
import { createLayoutBase, createPropsGetter, findLastIndex, findFirstDeepestPanel, findTabParentPanel, splitLayoutId } from './dock-layout-manager.utilities';
import { createTabData } from './dock-layout-manager.utilities/create-layout-base';
import { selectTabDataFromTabDataSchema } from './dock-layout-manager.selectors';
import { TabTitle } from './TabTitle';




const createNewWindowFeatures = (tabData: TabData): IWindowFeatures => {
  const { parent: panelData } = tabData;

  if (isNullOrUndefined(panelData)) {
    const features: IWindowFeatures = {
      width: 600,
      height: 480,
    };

    return features;
  }

  const panelElement = document.querySelectorAll(`[data-dockid='${panelData.id!}']`)[0];

  type PositionMap = {
    x: keyof Pick<ClientRect, 'left'>;
    y: keyof Pick<ClientRect, 'top'>;
    w: keyof Pick<ClientRect, 'width'>;
    h: keyof Pick<ClientRect, 'height'>;
  }
  const positonMap: PositionMap = {
    w: 'width',
    h: 'height',
    x: 'left',
    y: 'top',
  };

  const features: IWindowFeatures = {
    width: 0,
    height: 0,
  };

  Object.keys(positonMap).forEach((key) => {
    const knownValue = panelData[key as keyof Pick<PanelData, 'x' | 'y'>];
    const positonMapKey = positonMap[key as keyof PositionMap];
    if (!isNullOrUndefined(knownValue)) {
      features[positonMapKey] = knownValue;
    } else {
      const rect = panelElement.getBoundingClientRect();
      features[positonMapKey] = rect[positonMapKey];
    }
  });

  return features;
};

const createDefaultLayout = (tabBase: TabBase): LayoutBase => {
  return {
    dockbox: {
      id: '+1',
      mode: 'horizontal',
      children: [
        {
          id: '+0',
          tabs: [
            {
              id: tabBase.id,
            },
          ],
        },
      ],
    },
  };
};



// #region Type declarations
export interface DockLayoutManagerApi {
  /**
   * Adds a tab to a panel using lookup reference IDs.
   *
   * @param {string} tabKey The schema lookup key of the tab to be added.
   * @param {panelId} panelId The ID of the panel to add to.
   * @returns {(string|undefined)} `tabId` — The ID of the created tab, if it was created.
   */
  addTabKeyToPanelId: (tabKey: string, panelId: string) => (string | undefined);

  /**
   * Adds a tab to the active panel using lookup reference IDs
   * without specifying the target panel directly.
   *
   * @public
   * @param {string} tabKey The schema lookup key of the tab to be added.
   * @returns {(string|undefined)} `tabId` — The ID of the created tab, if it was created.
   */
  addTabKeyToActivePanel: (tabKey: string) => (string | undefined);

  /**
   * Sets the initial layout tree.
   *
   * @public
   * @param {LayoutBase} savedLayout The "essential" layout tree details before passing them into the `<DockLayout>` component.
   */
  loadLayout: DockLayout['loadLayout'];

  /**
   * Generates "essential" layout tree details from the `<DockLayout>` component's state.
   *
   * @public
   * @returns {LayoutBase | undefined} The "essential" layout tree details.
   */
  saveLayout: () => (LayoutBase | undefined);
}

export type DockLayoutManagerDefaultProps = {
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
};

export type DockLayoutManagerProps = Omit<DockLayoutProps, 'onLayoutChange' | 'defaultLayout' | 'layout'> & Partial<DockLayoutManagerDefaultProps> & {
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

  onTabDetach?: (id: TabBase['id']) => void;
  onTabMaximize?: (id: TabBase['id']) => void;

  defaultDetachedWindowLayout?: DetachedWindowLayout;
  detachedWindowLayout?: DetachedWindowLayout;
};

export type DockLayoutManagerState = Required<Pick<DockLayoutManagerProps, 'activePanelId' | 'layout' | 'detachedWindowLayout'>> & {
};
// #endregion

// #region Constant declarations
export const dockLayoutManagerAutoControlledManager = new AutoControlledManager<DockLayoutManagerState, DockLayoutManagerProps>(
  [
    'activePanelId',
    'layout',
  ],
  {
    getInitialAutoControlledState() {
      return {
        activePanelId: '',
        layout: createLayoutBase(),
        detachedWindowLayout: {},
      };
    },
  },
);

export const dockLayoutManagerDefaultProps: DockLayoutManagerDefaultProps = {
  tabIdPrefix: LAYOUT_TAB_DATA_SCHEMA_ID_PREFIX,
  tabDataSchema: {},
};

export const getDockLayoutManagerProps = createPropsGetter(dockLayoutManagerDefaultProps);
// #endregion


export class DockLayoutManager
  extends Component<DockLayoutManagerProps, DockLayoutManagerState>
  implements AutoControlled<DockLayoutManagerState>, DockLayoutManagerApi {
  /** Reference to the `<DockLayout>` component API. */
  dockLayout = createRef<DockLayout>();

  static readonly defaultProps = dockLayoutManagerDefaultProps;
  static readonly getDerivedStateFromProps = dockLayoutManagerAutoControlledManager.getDerivedStateFromProps;

  state = dockLayoutManagerAutoControlledManager.getInitialAutoControlledStateFromProps(this.props);
  trySetState = dockLayoutManagerAutoControlledManager.trySetState;

  componentDidMount() {
    safeInvoke(this.props.onLayoutLoad, this.state.layout, this.state.activePanelId);
  }

  // #region Tab insertion methods
  public addTabKeyToPanelId: DockLayoutManagerApi['addTabKeyToPanelId'] = (tabKey, panelId) => {
    return safeInvokeWithRef(this.dockLayout, (dockLayout) => {
      const panelData = dockLayout.find(panelId);
      const tabData = this.createTabData(tabKey);

      dockLayout.dockMove(tabData, panelData, 'middle');

      return tabData.id;
    });
  }

  public addTabKeyToActivePanel: DockLayoutManagerApi['addTabKeyToActivePanel'] = (tabKey) => {
    if (this.state.activePanelId !== '') {
      return this.addTabKeyToPanelId(tabKey, this.state.activePanelId);
    } else {
      return this.addTabKeyToFirstAvailablePanel(tabKey);
    }
  }

  private addTabKeyToFirstAvailablePanel = (tabKey: string): (string | undefined) => {
    const { layout } = this.state;
    const panel = (
      findFirstDeepestPanel(layout.floatbox) ||
      findFirstDeepestPanel(layout.dockbox)
    );

    if (isNullOrUndefined(panel) || isNullOrUndefined(panel.id)) {
      return;
    }

    return safeInvokeWithRef(this.dockLayout, (dockLayout) => {
      const targetPanel = dockLayout.find(panel.id!) as PanelData;
      const dockLayoutProps = this.createDockLayoutProps(dockLayout, this.props);
      const currentLayout = DockLayout.loadLayoutData(layout, dockLayoutProps);
      const newTab = this.createTabData(tabKey);
      const newLayout = addTabToPanel(currentLayout, newTab, targetPanel);

      // Explicitly update the state of the underlying `dockLayout` to generate the `LayoutBase` format.
      // The generated result will be consumed by this manager's `handleLayoutChange` function
      dockLayout.changeLayout(newLayout, newTab.id);

      return newTab.id;
    });
  }

  private createTabData = (tabKey: string) => {
    const { tabIdPrefix, tabDataSchema } = getDockLayoutManagerProps(this.props);
    const { layout } = this.state;
    const tabNextIndex = findLastIndex(layout, this.props.tabIdPrefix) + 1;
    const tabData = Object.assign(
      {},
      selectTabDataFromTabDataSchema(tabKey, tabDataSchema),
      { id: `${tabKey}${tabIdPrefix}${tabNextIndex}` },
    );

    return tabData;
  }

  private createDockLayoutProps = (dockLayout: DockLayout, props: DockLayoutManagerProps): DockLayoutProps => {
    const { loadTab, afterPanelLoaded } = props;
    const defaultLayout = dockLayout.state.layout;
    const dockLayoutProps: DockLayoutProps = {
      afterPanelLoaded: afterPanelLoaded,
      defaultLayout: defaultLayout,
      loadTab: loadTab,
    };

    return dockLayoutProps;
  }
  // #endregion

  // #region Layout object methods
  public loadLayout = (savedLayout: LayoutBase) => {
    safeInvokeWithRef(this.dockLayout, (dockLayout) => {
      dockLayout.loadLayout(savedLayout);
    });
  }

  public saveLayout = () => {
    return safeInvokeWithRef(this.dockLayout, (dockLayout) => {
      return dockLayout.saveLayout();
    });
  }
  // #endregion

  // #region Layout default tab method overrides
  private doLoadTab: DockLayoutManagerProps['loadTab'] = (tabBase) => {
    const { tabIdPrefix, tabDataSchema } = getDockLayoutManagerProps(this.props);
    const [ tabKey, tabIndex ] = splitLayoutId(tabBase.id, tabIdPrefix);
    const tabData = selectTabDataFromTabDataSchema(tabKey, tabDataSchema);
    const tabTitle: TabData['title'] = (
      <TabTitle
        title={tabData.title}
        suffix={`${this.props.tabIdPrefix}${tabIndex}`}
        onDetachTabClick={this.handleTabDetachClick(tabBase.id)}
        onMaximizeTabClick={this.handleTabMaximizeClick(tabBase.id)}
      />
    );
    const finalTab: TabData = createTabData(Object.assign(
      {},
      tabBase,
      tabData,
      { title: tabTitle }
    ));

    return finalTab;
  }

  private doSaveTab: DockLayoutManagerProps['saveTab'];
  // #endregion

  // #region
  private detachTab = (id: string) => {
    // FIXME: Call safeInvokeWithRef once only, if possible.
    const tabData = safeInvokeWithRef(this.dockLayout, (dockLayout) => {
      return dockLayout.find(id);
    });

    if (isNullOrUndefined(tabData)) {
      return;
    }

    if ('tabs' in tabData) {
      return;
    }

    safeInvokeWithRef(this.dockLayout, (dockLayout) => {
      dockLayout.dockMove(tabData, null as any, 'remove');
    });

    const newDetachedWindowLayout: DetachedWindowLayout = {
      ...this.state.detachedWindowLayout,
      [id]: tabData,
    };

    this.trySetState({
      detachedWindowLayout: newDetachedWindowLayout,
    });
  }

  private attachTab = () => {}
  // #endregion

  // #region Layout event handlers
  private handleLayoutChange = (newLayout: LayoutBase, currentTabId: string | null) => {
    console.log('DEBUGME', 'handleLayoutChange');
    let activePanelId: string;

    // FIXME: This part is highly unpredictable. I don't know why, but rc-dock generates ids which are way off.
    if (currentTabId === null) {
      const { dockbox } = newLayout;
      const deepestPanel = findFirstDeepestPanel(dockbox) as PanelBase;
      activePanelId = deepestPanel.id!;
    } else {
      const currentTabPanel = findTabParentPanel(newLayout, currentTabId) || {} as PanelBase;
      activePanelId = currentTabPanel.id || this.state.activePanelId;
    }

    this.trySetState({
      layout: newLayout,
      activePanelId: activePanelId,
    });

    safeInvoke(this.props.onLayoutChange, newLayout, currentTabId, activePanelId);
  }

  private handlePanelLoaded: DockLayoutManagerProps['afterPanelLoaded'];
  private handlePanelSaved: DockLayoutManagerProps['afterPanelSaved'];

  private handleTabDetachClick = memorize((id: TabBase['id']) => this.withStopPropagation(() => {
    this.detachTab(id!);
    safeInvoke(this.props.onTabDetach, id);
  }));

  private handleTabMaximizeClick = memorize((id: TabBase['id']) => this.withStopPropagation(() => {
    safeInvoke(this.props.onTabMaximize, id);
  }));

  private withStopPropagation = <Event extends React.MouseEvent<HTMLButtonElement, MouseEvent>>(handleEvent: (event: Event) => void) => (event: Event) => {
    event.stopPropagation();
    return handleEvent(event);
  }
  // #endregion

  render() {
    // Ignore `defaultLayout`, `layout` from this.props.
    // Refer to the manager's internal `layout` state instead.
    // It should be able to govern itself without needing too much external control.
    const { style, groups, dropMode, tabDataSchema } = this.props;
    const { layout, detachedWindowLayout } = this.state;

    return (
      <Fragment>
        <DockLayout
          afterPanelLoaded={this.handlePanelLoaded}
          afterPanelSaved={this.handlePanelSaved}
          loadTab={this.doLoadTab}
          saveTab={this.doSaveTab}
          dropMode={dropMode}
          layout={layout}
          groups={groups}
          onLayoutChange={this.handleLayoutChange}
          ref={this.dockLayout}
          style={style}
        />
        {Object.keys(detachedWindowLayout).map((key) => {
          const defaultLayout = createDefaultLayout(detachedWindowLayout[key]);

          return (
            <NewWindow
              key={key}
              features={createNewWindowFeatures(detachedWindowLayout[key])}
            >
              <DockLayoutManager
                groups={groups}
                defaultActivePanelId={defaultLayout.dockbox.id}
                defaultLayout={defaultLayout}
                dropMode={dropMode}
                style={style}
                tabDataSchema={tabDataSchema}
              />
            </NewWindow>
          );
        })}
      </Fragment>
    );
  }
}
